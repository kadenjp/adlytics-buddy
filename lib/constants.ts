// Stripe Configuration - Public values that can be committed to version control
export const STRIPE_CONFIG = {
    // Price ID for your subscription plan (get this from Stripe Dashboard)
    PRICE_ID: 'price_1RpHGXEKdF0kpDHEhzDcOouD', // Your actual Stripe price ID

    // Publishable key (safe to expose in client-side code)
    PUBLISHABLE_KEY: 'pk_test_51RpG3uEKdF0kpDHEk9uvZeRyTc3GTW6cQhuIcKa2iq9tRAN7n6i3T3NzUZRC0UuIq03E3xdRUpnC6WKvsFndfn3z00pnGvfLME',
} as const;

// Supabase Configuration - Public values
export const SUPABASE_CONFIG = {
    URL: 'https://hpupdxvbgzzvyxcmtnhn.supabase.co',
    ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwdXBkeHZiZ3p6dnl4Y210bmhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNDgxODAsImV4cCI6MjA2ODgyNDE4MH0.yvWldPjIZvuy6I3jvAuN045b6EYHK4HI8SjXtZg4plY',
} as const;
