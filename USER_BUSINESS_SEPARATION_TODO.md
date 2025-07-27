# User/Business Separation Implementation Plan

## Overview
This document tracks the implementation of proper user and business information separation to support multi-user business accounts. The goal is to allow multiple users to access the same business account with role-based permissions.

## Database Structure Changes

### ✅ Already Completed
- [x] `user_information` table exists with proper user-specific data
- [x] `business_profiles` table exists with business-specific data
- [x] Signup form updated to separate user info from business info

### 🔄 Database Migrations Needed

#### 1. Create `businesses` table
```sql
-- Migration: create_businesses_table.sql
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  industry TEXT,
  website TEXT,
  address JSONB,
  target_radius INTEGER DEFAULT 25,
  business_goals TEXT[],
  target_age_min INTEGER DEFAULT 18,
  target_age_max INTEGER DEFAULT 65,
  target_audience TEXT[],
  business_type TEXT DEFAULT 'direct' CHECK (business_type IN ('agency', 'client', 'direct')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
```

#### 2. Create `business_users` junction table
```sql
-- Migration: create_business_users_table.sql
CREATE TABLE business_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  permissions JSONB DEFAULT '{
    "campaigns": true,
    "billing": false,
    "reports": true,
    "settings": false,
    "users": false
  }',
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(business_id, user_id)
);

-- Enable RLS
ALTER TABLE business_users ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_business_users_business_id ON business_users(business_id);
CREATE INDEX idx_business_users_user_id ON business_users(user_id);
```

#### 3. Migrate existing data from `business_profiles` to `businesses`
```sql
-- Migration: migrate_business_profiles_to_businesses.sql
-- Insert existing business profiles into businesses table
INSERT INTO businesses (
  name, industry, website, address, target_radius, business_goals,
  target_age_min, target_age_max, target_audience, business_type,
  created_at, updated_at
)
SELECT 
  business_name,
  industry,
  website,
  CASE 
    WHEN business_address IS NOT NULL 
    THEN jsonb_build_object('address', business_address)
    ELSE NULL
  END,
  target_radius,
  business_goals,
  target_age_min,
  target_age_max,
  target_audience,
  business_type,
  created_at,
  updated_at
FROM business_profiles;

-- Create business_users entries for existing users (as owners)
INSERT INTO business_users (business_id, user_id, role, permissions)
SELECT 
  b.id,
  bp.user_id,
  'owner',
  '{
    "campaigns": true,
    "billing": true,
    "reports": true,
    "settings": true,
    "users": true
  }'
FROM businesses b
JOIN business_profiles bp ON b.name = bp.business_name
WHERE bp.created_at = b.created_at; -- Match by name and creation time
```

#### 4. Update existing tables to reference `business_id`

##### 4.1 Update `campaigns` table
```sql
-- Migration: update_campaigns_add_business_id.sql
-- Add business_id column
ALTER TABLE campaigns ADD COLUMN business_id UUID REFERENCES businesses(id);

-- Populate business_id based on existing user_id
UPDATE campaigns 
SET business_id = (
  SELECT bu.business_id 
  FROM business_users bu 
  WHERE bu.user_id = campaigns.user_id 
  LIMIT 1
);

-- Make business_id required
ALTER TABLE campaigns ALTER COLUMN business_id SET NOT NULL;

-- Create index
CREATE INDEX idx_campaigns_business_id ON campaigns(business_id);

-- Note: Keep user_id for now to track who created the campaign
-- ALTER TABLE campaigns DROP COLUMN user_id; -- Do this after testing
```

##### 4.2 Update `google_ads_accounts` table
```sql
-- Migration: update_google_ads_accounts_add_business_id.sql
ALTER TABLE google_ads_accounts ADD COLUMN business_id UUID REFERENCES businesses(id);

UPDATE google_ads_accounts 
SET business_id = (
  SELECT bu.business_id 
  FROM business_users bu 
  WHERE bu.user_id = google_ads_accounts.user_id 
  LIMIT 1
);

ALTER TABLE google_ads_accounts ALTER COLUMN business_id SET NOT NULL;
CREATE INDEX idx_google_ads_accounts_business_id ON google_ads_accounts(business_id);
```

##### 4.3 Update `subscriptions` table
```sql
-- Migration: update_subscriptions_add_business_id.sql
ALTER TABLE subscriptions ADD COLUMN business_id UUID REFERENCES businesses(id);

UPDATE subscriptions 
SET business_id = (
  SELECT bu.business_id 
  FROM business_users bu 
  WHERE bu.user_id = subscriptions.user_id 
  LIMIT 1
);

ALTER TABLE subscriptions ALTER COLUMN business_id SET NOT NULL;
CREATE INDEX idx_subscriptions_business_id ON subscriptions(business_id);
```

#### 5. Create RLS policies
```sql
-- Migration: create_rls_policies.sql

-- Businesses RLS policies
CREATE POLICY "Users can view businesses they belong to" ON businesses
  FOR SELECT USING (
    id IN (
      SELECT business_id FROM business_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Business owners can update their business" ON businesses
  FOR UPDATE USING (
    id IN (
      SELECT business_id FROM business_users 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND is_active = true
    )
  );

-- Business users RLS policies
CREATE POLICY "Users can view business_users for their businesses" ON business_users
  FOR SELECT USING (
    business_id IN (
      SELECT business_id FROM business_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Business owners can manage business users" ON business_users
  FOR ALL USING (
    business_id IN (
      SELECT business_id FROM business_users 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND is_active = true
    )
  );

-- Update campaigns RLS policies
DROP POLICY IF EXISTS "Users can view own campaigns" ON campaigns;
CREATE POLICY "Users can view business campaigns" ON campaigns
  FOR SELECT USING (
    business_id IN (
      SELECT business_id FROM business_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can manage business campaigns" ON campaigns
  FOR ALL USING (
    business_id IN (
      SELECT business_id FROM business_users 
      WHERE user_id = auth.uid() 
      AND is_active = true
      AND (permissions->>'campaigns')::boolean = true
    )
  );
```

## Code Changes Required

### 1. Database Service Layer Updates

#### 1.1 Update Supabase types
```typescript
// File: integrations/supabase/types.ts
export interface Business {
  id: string;
  name: string;
  industry?: string;
  website?: string;
  address?: any;
  target_radius?: number;
  business_goals?: string[];
  target_age_min?: number;
  target_age_max?: number;
  target_audience?: string[];
  business_type?: 'agency' | 'client' | 'direct';
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

export interface BusinessUser {
  id: string;
  business_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  permissions: {
    campaigns: boolean;
    billing: boolean;
    reports: boolean;
    settings: boolean;
    users: boolean;
  };
  invited_by?: string;
  invited_at?: string;
  joined_at: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

#### 1.2 Create business service
```typescript
// File: lib/supabase/businesses.ts
import { supabase } from '@/integrations/supabase/client';
import type { Business, BusinessUser } from '@/integrations/supabase/types';

export class BusinessService {
  static async createBusiness(businessData: Partial<Business>, userId: string) {
    // Create business
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .insert(businessData)
      .select()
      .single();

    if (businessError) throw businessError;

    // Add user as owner
    const { error: userError } = await supabase
      .from('business_users')
      .insert({
        business_id: business.id,
        user_id: userId,
        role: 'owner',
        permissions: {
          campaigns: true,
          billing: true,
          reports: true,
          settings: true,
          users: true
        }
      });

    if (userError) throw userError;

    return business;
  }

  static async getUserBusinesses(userId: string) {
    const { data, error } = await supabase
      .from('business_users')
      .select(`
        *,
        business:businesses(*)
      `)
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) throw error;
    return data;
  }

  static async getCurrentBusiness() {
    // This would get the currently selected business from context
    // For now, get the first business the user belongs to
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const businesses = await this.getUserBusinesses(user.id);
    return businesses[0]?.business || null;
  }
}
```

### 2. Context Updates

#### 2.1 Create Business Context
```typescript
// File: contexts/BusinessContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { BusinessService } from '@/lib/supabase/businesses';
import type { Business, BusinessUser } from '@/integrations/supabase/types';

interface BusinessContextType {
  currentBusiness: Business | null;
  userBusinesses: (BusinessUser & { business: Business })[];
  switchBusiness: (businessId: string) => void;
  isLoading: boolean;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export function BusinessProvider({ children }: { children: React.ReactNode }) {
  const [currentBusiness, setCurrentBusiness] = useState<Business | null>(null);
  const [userBusinesses, setUserBusinesses] = useState<(BusinessUser & { business: Business })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Implementation here...
}

export const useBusiness = () => {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
};
```

### 3. Authentication Service Updates

#### 3.1 Update signup process
```typescript
// File: hooks/useAuth.tsx
const signUp = async (email: string, password: string, metadata: any) => {
  // Create user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: metadata.first_name,
        last_name: metadata.last_name,
        phone: metadata.phone
      }
    }
  });

  if (authError || !authData.user) throw authError;

  // Create user_information record
  const { error: userInfoError } = await supabase
    .from('user_information')
    .insert({
      user_id: authData.user.id,
      first_name: metadata.first_name,
      last_name: metadata.last_name,
      email: email,
      phone: metadata.phone
    });

  if (userInfoError) throw userInfoError;

  // Create business and business_user relationship
  const business = await BusinessService.createBusiness({
    name: metadata.business_name,
    industry: metadata.industry,
    stripe_customer_id: metadata.stripe_customer_id,
    stripe_subscription_id: metadata.stripe_subscription_id
  }, authData.user.id);

  return { user: authData.user, business };
};
```

### 4. Component Updates

#### 4.1 Update signup form submission
```typescript
// File: components/pages/Signup.tsx
const handlePaymentSuccess = async (customerId: string, subscriptionId: string) => {
  setStripeCustomerId(customerId);
  setStripeSubscriptionId(subscriptionId);

  setLoading(true);
  try {
    const { error: authError } = await signUp(userInfo.email, userInfo.password, {
      first_name: userInfo.firstName,
      last_name: userInfo.lastName,
      phone: userInfo.phone,
      promo_code: userInfo.promoCode,
      business_name: businessInfo.businessName,
      industry: businessInfo.industry,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId
    });

    if (authError) {
      setError(`Payment successful but account creation failed: ${authError.message}`);
      setLoading(false);
      return;
    }

    setLoading(false);
    setCurrentStep(4);
  } catch (err) {
    setError('Payment successful but account creation failed. Please contact support.');
    setLoading(false);
  }
};
```

#### 4.2 Update dashboard and other components
- Update all components to use `useBusiness()` hook instead of user-based queries
- Update campaign creation/management to use business context
- Update Google Ads integration to use business-level accounts

### 5. UI/UX Enhancements

#### 5.1 Business Switcher Component
```typescript
// File: components/BusinessSwitcher.tsx
// Dropdown component to switch between businesses user has access to
```

#### 5.2 Team Management Page
```typescript
// File: components/pages/TeamManagement.tsx
// Interface to invite/manage team members
// Role-based permissions management
```

## Implementation Order

### Phase 1: Database Foundation
1. [ ] Create `businesses` table migration
2. [ ] Create `business_users` table migration
3. [ ] Migrate existing `business_profiles` data
4. [ ] Test data migration in development

### Phase 2: Core Service Layer
1. [ ] Update Supabase types
2. [ ] Create `BusinessService` class
3. [ ] Update `useAuth` hook for new signup flow
4. [ ] Create `BusinessContext` and provider

### Phase 3: Update Existing Features
1. [ ] Update campaigns to use business context
2. [ ] Update Google Ads integration
3. [ ] Update subscriptions and billing
4. [ ] Update all RLS policies

### Phase 4: New Multi-User Features
1. [ ] Create business switcher component
2. [ ] Create team management interface
3. [ ] Implement user invitation system
4. [ ] Add role-based permissions throughout app

### Phase 5: Testing & Cleanup
1. [ ] Test all existing functionality
2. [ ] Remove deprecated `user_id` columns where appropriate
3. [ ] Clean up old `business_profiles` table
4. [ ] Update documentation

## Migration Safety Notes

- **Keep `user_id` columns initially** - Don't drop them until business_id is fully implemented and tested
- **Use transactions** - Wrap related migrations in transactions to ensure consistency
- **Backup first** - Always backup production data before running migrations
- **Test in staging** - Run all migrations in staging environment first
- **Gradual rollout** - Consider feature flags for new multi-user functionality

## Testing Checklist

- [ ] Existing users can sign in and access their businesses
- [ ] New users can sign up and create businesses
- [ ] Campaign creation/management works with business context
- [ ] Google Ads integration works at business level
- [ ] Billing/subscriptions are properly associated with businesses
- [ ] RLS policies prevent unauthorized access
- [ ] User can be added to multiple businesses
- [ ] Role-based permissions work correctly

## Future Enhancements

- [ ] Business ownership transfer
- [ ] Audit logging for business actions
- [ ] Business-level API keys
- [ ] White-label customization per business
- [ ] Business-level reporting and analytics
