'use client'

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Check, AlertCircle, Zap } from 'lucide-react';
import PaymentForm from '@/components/PaymentForm';
import { usePaymentStep } from '@/hooks/usePaymentStep';

interface UserInfo {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string;
    promoCode: string;
}

interface PaymentInfo {
    termsAccepted: boolean;
}

interface PaymentStepProps {
    userInfo: UserInfo;
    paymentInfo: PaymentInfo;
    setPaymentInfo: (paymentInfo: PaymentInfo | ((prev: PaymentInfo) => PaymentInfo)) => void;
    error: string;
    loading: boolean;
    onPaymentSuccess: (customerId: string, subscriptionId: string) => void;
    onPaymentError: (message: string) => void;
    onPrevious: () => void;
    setLoading: (loading: boolean) => void;
}

export const PaymentStep = ({
    userInfo,
    paymentInfo,
    setPaymentInfo,
    error,
    loading,
    onPaymentSuccess,
    onPaymentError,
    onPrevious,
    setLoading
}: PaymentStepProps) => {
    const { handleTermsChecked } = usePaymentStep(setPaymentInfo);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Platform Subscription</CardTitle>
                <CardDescription>
                    Secure your platform access - no advertising budget required
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <div className="bg-gradient-card rounded-lg p-6 border">
                    <div className="text-center space-y-4">
                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                            Platform Access
                        </Badge>
                        <div className="text-4xl font-bold">$150<span className="text-xl text-muted-foreground">/month</span></div>
                        <p className="text-muted-foreground">Everything you need to create and manage campaigns</p>
                    </div>

                    <div className="mt-6 space-y-3">
                        {[
                            "AI-powered campaign builder",
                            "Keyword research & optimization",
                            "Performance tracking & reports",
                            "Mobile campaign management",
                            "Expert support when needed",
                            "No long-term contracts"
                        ].map((feature, index) => (
                            <div key={index} className="flex items-center space-x-3">
                                <Check className="h-5 w-5 text-success flex-shrink-0" />
                                <span>{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                        <Zap className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium text-primary">No Advertising Budget Required</p>
                            <p className="text-sm text-muted-foreground">
                                Start building campaigns immediately. Set your advertising budget when you're ready to launch.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <PaymentForm
                        email={userInfo.email}
                        name={`${userInfo.firstName} ${userInfo.lastName}`}
                        onSuccess={onPaymentSuccess}
                        onError={onPaymentError}
                        loading={loading}
                        setLoading={setLoading}
                    />
                </div>

                {loading && (
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            Processing payment and creating your account...
                        </AlertDescription>
                    </Alert>
                )}

                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="terms"
                        checked={paymentInfo.termsAccepted}
                        onCheckedChange={handleTermsChecked}
                    />
                    <Label htmlFor="terms" className="text-sm">
                        I agree to the Terms of Service and Privacy Policy
                    </Label>
                </div>
            </CardContent>
            <div className="p-6 pt-0">
                <div className="flex justify-between">
                    <Button variant="outline" onClick={onPrevious}>
                        Previous
                    </Button>
                    <div className="text-sm text-muted-foreground">
                        Complete payment above to continue
                    </div>
                </div>
            </div>
        </Card>
    );
};
