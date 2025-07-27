'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Progress } from '@/components/ui/progress';
import { Zap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import StripeProvider from '@/components/StripeProvider';
import { supabase } from '@/integrations/supabase/client';
import { UserInfoStep, BusinessInfoStep, BusinessProfileStep, PaymentStep, WelcomeStep } from '@/components/signup';

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

const Signup = () => {
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
  const { signUp, isAuthenticated, user } = useAuth();

  // Redirect if already authenticated and not on step 5
  if (isAuthenticated && currentStep < 5) {
    router.push('/dashboard');
    return null;
  }

  const handlePaymentSuccess = async (customerId: string, subscriptionId: string) => {
    setStripeCustomerId(customerId);
    setStripeSubscriptionId(subscriptionId);

    // Create user account immediately after successful payment
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
      setCurrentStep(5); // Go to welcome step
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
      // Validate user info
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
      // Validate business info
      if (!businessInfo.businessName) {
        setError('Business name is required');
        return;
      }

      setCurrentStep(3);
      return;
    }

    if (currentStep === 3) {
      // Business profile step - no validation needed, just continue
      setCurrentStep(4);
      return;
    }

    if (currentStep === 4) {
      // Payment will be handled by the PaymentForm component
      // Don't advance step here - PaymentForm will call handlePaymentSuccess
      return;
    }

    if (currentStep === 5) {
      // Update business profile with additional business information and redirect to dashboard
      setLoading(true);

      try {
        // Update the business with additional profile information if any was provided
        if (businessProfile.address || businessProfile.businessGoals.length > 0 || businessProfile.targetAudience.length > 0) {
          // First, get the user's business ID
          const { data: businessUsers, error: businessUsersError } = await supabase
            .from('business_users')
            .select('business_id')
            .eq('user_id', user?.id)
            .eq('is_active', true)
            .single();

          if (businessUsersError || !businessUsers) {
            setError('Could not find your business profile. Please contact support.');
            setLoading(false);
            return;
          }

          // Update the business with additional profile information
          const { error: updateError } = await supabase
            .from('businesses')
            .update({
              address: businessProfile.address ? { address: businessProfile.address } : null,
              target_radius: businessProfile.targetRadius,
              business_goals: businessProfile.businessGoals,
              target_age_min: businessProfile.targetAge[0],
              target_age_max: businessProfile.targetAge[1],
              target_audience: businessProfile.targetAudience,
              updated_at: new Date().toISOString()
            })
            .eq('id', businessUsers.business_id);

          if (updateError) {
            setError(updateError.message);
            setLoading(false);
            return;
          }
        }

        // Redirect to dashboard
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
    setCurrentStep(4); // Go to payment step
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center space-x-4 mb-8">
      {[1, 2, 3, 4, 5].map((step) => (
        <div key={step} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step <= currentStep
            ? 'bg-primary text-white'
            : 'bg-muted text-muted-foreground'
            }`}>
            {step}
          </div>
          {step < 5 && (
            <div className={`w-12 h-0.5 ${step < currentStep ? 'bg-primary' : 'bg-muted'
              }`} />
          )}
        </div>
      ))}
    </div>
  );

  const getStepLabels = () => {
    const labels = ['Your Info', 'Business', 'Profile', 'Payment', 'Welcome'];
    return labels[currentStep - 1];
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <UserInfoStep
            userInfo={userInfo}
            setUserInfo={setUserInfo}
            error={error}
            loading={loading}
            onNext={nextStep}
            onPrevious={prevStep}
            canGoBack={false}
          />
        );
      case 2:
        return (
          <BusinessInfoStep
            businessInfo={businessInfo}
            setBusinessInfo={setBusinessInfo}
            error={error}
            loading={loading}
            onNext={nextStep}
            onPrevious={prevStep}
          />
        );
      case 3:
        return (
          <BusinessProfileStep
            businessProfile={businessProfile}
            setBusinessProfile={setBusinessProfile}
            error={error}
            loading={loading}
            onNext={nextStep}
            onPrevious={prevStep}
            onSkip={skipToPayment}
          />
        );
      case 4:
        return (
          <PaymentStep
            userInfo={userInfo}
            paymentInfo={paymentInfo}
            setPaymentInfo={setPaymentInfo}
            error={error}
            loading={loading}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentError={handlePaymentError}
            onPrevious={prevStep}
            setLoading={setLoading}
          />
        );
      case 5:
        return <WelcomeStep loading={loading} />;
      default:
        return null;
    }
  };

  return (
    <StripeProvider>
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
        <div className="container mx-auto max-w-2xl">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold">AdsCampaign</span>
            </div>
            <h1 className="text-3xl font-bold">Create Your Account</h1>
            <p className="text-muted-foreground">Step {currentStep} of 5 - {getStepLabels()}</p>
          </div>

          {renderStepIndicator()}
          {renderCurrentStep()}
        </div>
      </div>
    </StripeProvider>
  );
};

export default Signup;