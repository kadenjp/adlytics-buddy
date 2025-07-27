'use client';

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { STRIPE_CONFIG } from '@/lib/constants';

const stripePromise = loadStripe(STRIPE_CONFIG.PUBLISHABLE_KEY);

interface StripeProviderProps {
    children: React.ReactNode;
}

export default function StripeProvider({ children }: StripeProviderProps) {
    return (
        <Elements stripe={stripePromise}>
            {children}
        </Elements>
    );
}
