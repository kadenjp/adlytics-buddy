'use client';

import { useState } from 'react';
import {
    useStripe,
    useElements,
    CardElement,
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface PaymentFormProps {
    email: string;
    name: string;
    onSuccess: (customerId: string, subscriptionId: string) => void;
    onError: (message: string) => void;
    loading: boolean;
    setLoading: (loading: boolean) => void;
}

const CARD_ELEMENT_OPTIONS = {
    style: {
        base: {
            fontSize: '16px',
            color: '#424770',
            '::placeholder': {
                color: '#aab7c4',
            },
            fontFamily: 'system-ui, -apple-system, sans-serif',
        },
        invalid: {
            color: '#9e2146',
        },
    },
    hidePostalCode: true,
};

export default function PaymentForm({
    email,
    name,
    onSuccess,
    onError,
    loading,
    setLoading,
}: PaymentFormProps) {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState('');

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!stripe || !elements) {
            setError('Stripe has not loaded yet. Please try again.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const cardElement = elements.getElement(CardElement);
            if (!cardElement) {
                throw new Error('Card element not found');
            }

            // Create payment method
            const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
                type: 'card',
                card: cardElement,
                billing_details: {
                    email,
                    name,
                },
            });

            if (paymentMethodError) {
                throw new Error(paymentMethodError.message);
            }

            // Create subscription
            const response = await fetch('/api/create-subscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    name,
                    paymentMethodId: paymentMethod.id,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create subscription');
            }

            // Confirm payment if needed
            if (data.clientSecret) {
                const { error: confirmError } = await stripe.confirmCardPayment(data.clientSecret);
                if (confirmError) {
                    throw new Error(confirmError.message);
                }
            }

            onSuccess(data.customerId, data.subscriptionId);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
            setError(errorMessage);
            onError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="space-y-2">
                <Label>Card Information</Label>
                <div className="p-3 border rounded-md bg-background">
                    <CardElement options={CARD_ELEMENT_OPTIONS} />
                </div>
            </div>

            <Button
                type="submit"
                className="w-full"
                disabled={!stripe || !elements || loading}
            >
                {loading ? 'Processing...' : 'Subscribe & Continue'}
            </Button>
        </form>
    );
}
