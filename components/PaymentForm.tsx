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
    const [address, setAddress] = useState({
        line1: '',
        city: '',
        state: '',
        postal_code: '',
        country: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAddress({ ...address, [e.target.name]: e.target.value });
    };

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
                    address,
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
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="line1">Address Line 1</Label>
                <input
                    id="line1"
                    name="line1"
                    type="text"
                    value={address.line1}
                    onChange={handleChange}
                    required
                    className="w-full border rounded px-2 py-1"
                />
                <Label htmlFor="city">City</Label>
                <input
                    id="city"
                    name="city"
                    type="text"
                    value={address.city}
                    onChange={handleChange}
                    required
                    className="w-full border rounded px-2 py-1"
                />
                <Label htmlFor="state">State</Label>
                <input
                    id="state"
                    name="state"
                    type="text"
                    value={address.state}
                    onChange={handleChange}
                    required
                    className="w-full border rounded px-2 py-1"
                />
                <Label htmlFor="postal_code">Postal Code</Label>
                <input
                    id="postal_code"
                    name="postal_code"
                    type="text"
                    value={address.postal_code}
                    onChange={handleChange}
                    required
                    className="w-full border rounded px-2 py-1"
                />
                <Label htmlFor="country">Country</Label>
                <input
                    id="country"
                    name="country"
                    type="text"
                    value={address.country}
                    onChange={handleChange}
                    required
                    className="w-full border rounded px-2 py-1"
                />
            </div>

            <div className="space-y-2">
                <Label>Card Information</Label>
                <div className="p-3 border rounded-md bg-background">
                    <CardElement options={CARD_ELEMENT_OPTIONS} />
                </div>
            </div>

            {error && (
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

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
