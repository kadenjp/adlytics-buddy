# Stripe Duplicate Customer Prevention

This document outlines the strategies implemented to prevent duplicate Stripe customers in the application.

## Problem
Without proper checks, multiple Stripe customers could be created for the same user, leading to:
- Billing confusion
- Data inconsistency
- Poor user experience
- Difficulty managing subscriptions

## Solutions Implemented

### 1. Email-Based Customer Search
**Function:** `findOrCreateStripeCustomer()`
- Searches for existing customers by email before creating new ones
- Updates existing customer information if needed (name, address changes)
- Uses Stripe's `customers.list()` API with email filter

### 2. Database-First Approach
**Function:** `findOrCreateStripeCustomerWithDB()`
- Checks local database for existing `stripe_customer_id` first
- Verifies the customer still exists in Stripe (handles deleted customers)
- Updates database with new customer ID when created
- Faster than API calls for subsequent checks

### 3. Idempotency Keys
**Function:** `generateStripeIdempotencyKey()`
- Generates deterministic keys based on email and operation type
- Ensures identical requests don't create duplicates
- Keys are valid for 24 hours (Stripe's limit)
- Format: `{operation}_{clean_email}_{timestamp}`

### 4. Comprehensive Error Handling
- Graceful fallback if database lookups fail
- Handles deleted/invalid Stripe customers
- Logs warnings for debugging

## Implementation Flow

### New Signup Process
1. User completes payment form
2. `findOrCreateStripeCustomerWithDB()` is called
3. Database is checked for existing `stripe_customer_id`
4. If not found, Stripe API searches by email
5. If no existing customer, creates new one with idempotency key
6. Database is updated with customer ID
7. Subscription is created

### Existing User Process
1. Database lookup finds existing `stripe_customer_id`
2. Stripe customer is verified to still exist
3. Customer info is updated if needed
4. Existing customer is used for new subscriptions

## Usage Examples

### Basic Usage (Backwards Compatible)
```typescript
// This still works and now prevents duplicates
const customer = await createStripeCustomer(email, name, address);
```

### Enhanced Usage with Database Check
```typescript
// Preferred for applications with database tracking
const customer = await findOrCreateStripeCustomerWithDB(
  email, 
  name, 
  businessId, 
  address,
  idempotencyKey
);
```

### Custom Idempotency Key
```typescript
const idempotencyKey = generateStripeIdempotencyKey(email, 'customer');
const customer = await findOrCreateStripeCustomer(email, name, address, idempotencyKey);
```

## Benefits

1. **No Duplicate Customers**: Multiple layers prevent duplicate creation
2. **Data Consistency**: Database and Stripe stay in sync
3. **Performance**: Database checks are faster than API calls
4. **Reliability**: Idempotency keys handle network issues/retries
5. **Backwards Compatibility**: Existing code continues to work
6. **User Experience**: Seamless handling of repeat signups

## Configuration

The system uses the existing database schema:
- `businesses.stripe_customer_id` stores the Stripe customer ID
- Automatic updates when customers are created/found

No additional configuration required - the improvements are automatic and backwards compatible.

## Testing Scenarios

### Test Cases to Verify
1. **New User**: Creates customer successfully
2. **Existing Email**: Finds existing customer, doesn't create duplicate
3. **Database Mismatch**: Handles case where DB has invalid customer ID
4. **Network Retry**: Idempotency key prevents duplicate on retry
5. **Information Update**: Updates customer name/address when changed

### Manual Testing
1. Complete signup flow twice with same email
2. Check Stripe dashboard for single customer
3. Verify database has correct customer ID
4. Test with network interruptions/retries

## Monitoring

Watch for these log messages:
- `Stripe customer not found, will create new one` - Normal fallback
- `Stripe subscription error` - Investigate potential issues

## Future Enhancements

1. **User-Based Lookup**: Extend to check by user ID for logged-in users
2. **Bulk Reconciliation**: Script to sync existing data
3. **Webhook Handling**: Handle customer deletion events from Stripe
4. **Cache Layer**: Add Redis cache for frequent lookups
