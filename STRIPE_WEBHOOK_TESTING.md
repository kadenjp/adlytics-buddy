# Stripe Webhook Testing Guide

This guide explains how to test Stripe webhook events locally and in development using the Stripe CLI.

---

## 1. Install Stripe CLI

If you don't have it installed:
```sh
brew install stripe/stripe-cli/stripe
```
Or see: https://stripe.com/docs/stripe-cli

---

## 2. Authenticate Stripe CLI

```sh
stripe login
```
This will open a browser window to authenticate your CLI with your Stripe account.

---

## 3. Start Listening for Webhooks

Run this command in your project directory:
```sh
stripe listen --forward-to localhost:3000/api/stripe/webhook
```
- Replace `localhost:3000/api/stripe/webhook` with your actual local webhook endpoint.
- The CLI will display a webhook signing secret (`whsec_...`). Use this in your `.env.local` as `STRIPE_WEBHOOK_SECRET`.

---

## 4. Trigger Test Events

You can trigger test events using the Stripe CLI:

```sh
stripe trigger customer.subscription.created
stripe trigger customer.subscription.updated
stripe trigger customer.subscription.deleted
stripe trigger invoice.payment_succeeded
stripe trigger invoice.payment_failed
stripe trigger customer.subscription.trial_will_end
```

See all available triggers:
```sh
stripe trigger --help
```

---

## 5. Check Your Server Logs

Your local server should receive the events and process them as if they came from Stripe in production. Check your logs/output for confirmation.

---

## 6. Testing in Production (Vercel)

- Set your webhook endpoint in Stripe Dashboard to your deployed URL, e.g.:
  `https://your-app.vercel.app/api/stripe/webhook`
- Copy the webhook signing secret from Stripe Dashboard and set it in your Vercel environment variables as `STRIPE_WEBHOOK_SECRET`.
- Stripe will send real events to your production endpoint.

---

## References
- [Stripe CLI Docs](https://stripe.com/docs/stripe-cli)
- [Stripe Webhooks Docs](https://stripe.com/docs/webhooks)
