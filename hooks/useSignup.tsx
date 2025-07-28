import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserService } from '@/lib/services/UserService';
import { supabaseUserInformationDatabase } from '@/lib/providers/supabase/SupabaseUserInformationDatabaseProvider';
import { supabaseBusinessProfileDatabase } from '@/lib/providers/supabase/SupabaseBusinessProfileDatabaseProvider';

const initialUserInfo = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    promoCode: ''
};

const initialBusinessInfo = {
    businessName: '',
    industry: ''
};

const initialBusinessProfile = {
    address: '',
    targetRadius: 25,
    businessGoals: [] as string[],
    targetAge: [25, 55] as [number, number],
    targetAudience: [] as string[]
};

const initialPaymentInfo = {
    termsAccepted: false
};

export function useSignup(auth) {
    const [currentStep, setCurrentStep] = useState(1);
    const [userInfo, setUserInfo] = useState(initialUserInfo);
    const [businessInfo, setBusinessInfo] = useState(initialBusinessInfo);
    const [businessProfile, setBusinessProfile] = useState(initialBusinessProfile);
    const [paymentInfo, setPaymentInfo] = useState(initialPaymentInfo);
    const [stripeCustomerId, setStripeCustomerId] = useState('');
    const [stripeSubscriptionId, setStripeSubscriptionId] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { signUp, isAuthenticated, user } = auth;

    // Redirect if already authenticated and not on step 5
    if (isAuthenticated && currentStep < 5) {
        router.push('/dashboard');
        return null;
    }

    const handlePaymentSuccess = async (customerId: string, subscriptionId: string) => {
        setStripeCustomerId(customerId);
        setStripeSubscriptionId(subscriptionId);
        setLoading(true);
        try {
            const { error: authError } = await signUp(userInfo.email, userInfo.password, {
                business_name: businessInfo.businessName,
                first_name: userInfo.firstName,
                last_name: userInfo.lastName,
                industry: businessInfo.industry,
                phone: userInfo.phone,
                promo_code: userInfo.promoCode,
                stripe_customer_id: customerId,
                stripe_subscription_id: subscriptionId
            });
            if (authError) {
                setError(`Payment successful but account creation failed: ${authError.message}`);
                setLoading(false);
                return;
            }
            setLoading(false);
            setCurrentStep(5);
        } catch (err) {
            setError('Payment successful but account creation failed. Please contact support.');
            setLoading(false);
        }
    };

    const handlePaymentError = (message: string) => {
        setError(message);
    };

    const nextStep = async () => {
        setError('');
        if (currentStep === 1) {
            if (!userInfo.email || !userInfo.password) {
                setError('Email and password are required');
                return;
            }
            if (!userInfo.firstName || !userInfo.lastName) {
                setError('First name and last name are required');
                return;
            }
            setCurrentStep(2);
            return;
        }
        if (currentStep === 2) {
            if (!businessInfo.businessName) {
                setError('Business name is required');
                return;
            }
            setCurrentStep(3);
            return;
        }
        if (currentStep === 3) {
            setCurrentStep(4);
            return;
        }
        if (currentStep === 4) {
            return;
        }
        if (currentStep === 5) {
            setLoading(true);
            try {
                if (businessProfile.address || businessProfile.businessGoals.length > 0 || businessProfile.targetAudience.length > 0) {
                    const userService = new UserService(
                        supabaseUserInformationDatabase,
                        supabaseBusinessProfileDatabase
                    );
                    await userService.updateBusinessProfile(user?.id, {
                        business_address: businessProfile.address ? businessProfile.address : null,
                        target_radius: businessProfile.targetRadius,
                        business_goals: businessProfile.businessGoals,
                        target_age_min: businessProfile.targetAge[0],
                        target_age_max: businessProfile.targetAge[1],
                        target_audience: businessProfile.targetAudience,
                        updated_at: new Date().toISOString()
                    });
                }
                setLoading(false);
                router.push('/dashboard');
            } catch (err) {
                setError('An unexpected error occurred. Please try again.');
                setLoading(false);
            }
            return;
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const skipToPayment = () => {
        setCurrentStep(4);
    };

    return {
        currentStep,
        setCurrentStep,
        userInfo,
        setUserInfo,
        businessInfo,
        setBusinessInfo,
        businessProfile,
        setBusinessProfile,
        paymentInfo,
        setPaymentInfo,
        stripeCustomerId,
        stripeSubscriptionId,
        error,
        setError,
        loading,
        setLoading,
        nextStep,
        prevStep,
        skipToPayment,
        handlePaymentSuccess,
        handlePaymentError,
        isAuthenticated,
        user
    };
}
