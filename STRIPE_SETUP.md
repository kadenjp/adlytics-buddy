# Stripe Payment Integration Setup

This guide will help you set up Stripe payments for the AdsCampaign platform's $150/month subscription.

## Prerequisites

1. **Stripe Account**: Create an account at [stripe.com](https://stripe.com)
2. **Stripe Test Mode**: Use test mode for development

## Step 1: Get Your Stripe Keys

1. Log into your Stripe Dashboard
2. Go to **Developers > API Keys**
3. Copy your **Publishable key** (starts with `pk_test_`)
4. Copy your **Secret key** (starts with `sk_test_`)

## Step 2: Create a Product and Price

1. In Stripe Dashboard, go to **Products**
2. Click **Add product**
3. Set:
   - **Name**: "AdsCampaign Platform Access"
   - **Description**: "Monthly subscription for campaign builder platform"
   - **Pricing**: $150.00 USD, Recurring monthly
4. After creating, copy the **Price ID** (starts with `price_`)

## Step 3: Environment Variables

Create a `.env.local` file in your project root with:

```bash
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_PRICE_ID=price_your_price_id_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Existing Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
```

## Step 4: Set Up Webhooks (For Production)

1. In Stripe Dashboard, go to **Developers > Webhooks**
2. Click **Add endpoint**
3. Set endpoint URL: `https://yourdomain.com/api/stripe/webhook`
4. Select events to listen for:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the **Signing secret** (starts with `whsec_`) and add to your environment variables

## Step 5: Update Supabase Database Schema

Add these columns to your `profiles` table:

```sql
-- Add Stripe-related columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_payment_date TIMESTAMPTZ;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON profiles(subscription_status);
```

## How It Works

### Signup Flow
1. **Step 1**: User enters business information
2. **Step 2**: User enters payment information via Stripe Elements
   - Creates Stripe customer
   - Creates subscription
   - Processes payment
3. **Step 3**: User completes business profile
4. **Step 4**: Account creation with all data including Stripe IDs

### Payment Processing
- Uses Stripe Elements for secure card input
- Creates customer and subscription in one flow
- Handles 3D Secure authentication automatically
- Stores Stripe customer and subscription IDs in user profile

### Webhook Handling
- Receives real-time updates from Stripe
- Updates subscription status in database
- Handles payment success/failure events
- Manages subscription lifecycle

## Testing

### Test Card Numbers
Use these test cards in development:

- **Success**: `4242 4242 4242 4242`
- **Declined**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`
- **Expiry**: Any future date (e.g., 12/34)
- **CVC**: Any 3 digits (e.g., 123)

### Testing the Flow
1. Start the development server: `npm run dev`
2. Go to `/signup`
3. Fill out Step 1 with valid information
4. In Step 2, use a test card number
5. Complete Step 3 with business profile
6. Verify account creation in Step 4

## Production Checklist

- [ ] Switch to live Stripe keys (remove `_test_` from keys)
- [ ] Set up production webhook endpoint
- [ ] Update environment variables with live keys
- [ ] Test with real payment methods
- [ ] Set up monitoring for failed payments
- [ ] Configure email notifications for billing events

## File Structure

```
lib/
  stripe.ts                 # Stripe client configuration
app/api/
  create-subscription/
    route.ts               # Creates Stripe customer and subscription
  stripe/webhook/
    route.ts               # Handles Stripe webhook events
components/
  StripeProvider.tsx       # Stripe Elements provider
  PaymentForm.tsx          # Secure payment form component
  pages/
    Signup.tsx            # Updated signup flow with Stripe
```

## Troubleshooting

### Common Issues

1. **"Stripe is not configured"**: Check environment variables are set correctly
2. **Payment fails**: Verify you're using test card numbers in development
3. **Webhook not receiving events**: Check endpoint URL and selected events
4. **Database errors**: Ensure Supabase schema is updated with new columns

### Debug Mode
Set `NODE_ENV=development` to see detailed error messages in the console.

## Security Notes

- Never expose secret keys in client-side code
- Use webhook signatures to verify event authenticity
- Store sensitive data (like customer IDs) in your secure database
- Always validate payment status server-side

## Support

For Stripe-related issues:
- Check the [Stripe Documentation](https://stripe.com/docs)
- Use Stripe's test mode for development
- Monitor webhook delivery in Stripe Dashboard
