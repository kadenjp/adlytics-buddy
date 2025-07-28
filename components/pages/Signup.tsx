'use client'

import { Zap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import StripeProvider from '@/components/StripeProvider';
import { UserInfoStep, BusinessInfoStep, BusinessProfileStep, PaymentStep, WelcomeStep } from '@/components/signup';
import { useSignup } from '@/hooks/useSignup';

const Signup = () => {
  const auth = useAuth();
  const {
    currentStep,
    setCurrentStep: _setCurrentStep,
    userInfo,
    setUserInfo,
    businessInfo,
    setBusinessInfo,
    businessProfile,
    setBusinessProfile,
    paymentInfo,
    setPaymentInfo,
    error,
    loading,
    setLoading,
    nextStep,
    prevStep,
    skipToPayment,
    handlePaymentSuccess,
    handlePaymentError,
    isAuthenticated
  } = useSignup(auth);

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

  if (isAuthenticated && currentStep < 5) {
    // Redirect handled in useSignup
    return null;
  }

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