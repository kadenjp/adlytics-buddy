'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Zap, Building2, Utensils, Scale, Hammer, Stethoscope, ShoppingBag, Car, GraduationCap, Users, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import StripeProvider from '@/components/StripeProvider';
import PaymentForm from '@/components/PaymentForm';

const initialBusinessInfo = {
  businessName: '',
  ownerName: '',
  email: '',
  password: '',
  industry: '',
  phone: '',
  promoCode: ''
};

const initialBusinessProfile = {
  address: '',
  targetRadius: 25,
  businessGoals: [] as string[],
  targetAge: [25, 55] as [number, number],
  targetAudience: [] as string[]
};

const initialPaymentInfo = {
  cardNumber: '',
  expiryDate: '',
  cvv: '',
  zipCode: '',
  termsAccepted: false
};

const industries = [
  { value: 'restaurant', label: 'Restaurant', icon: Utensils },
  { value: 'legal', label: 'Legal Services', icon: Scale },
  { value: 'construction', label: 'Construction', icon: Hammer },
  { value: 'healthcare', label: 'Healthcare', icon: Stethoscope },
  { value: 'retail', label: 'Retail', icon: ShoppingBag },
  { value: 'automotive', label: 'Automotive', icon: Car },
  { value: 'education', label: 'Education', icon: GraduationCap },
  { value: 'services', label: 'Professional Services', icon: Users },
];

const businessGoals = [
  'Increase phone calls',
  'Drive website traffic',
  'Get more appointments',
  'Boost online sales',
  'Increase foot traffic',
  'Build brand awareness'
];

const targetAudiences = [
  'Local customers',
  'Business professionals',
  'Families with children',
  'Young adults (18-35)',
  'Seniors (55+)',
  'High-income households'
];

const Signup = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [businessInfo, setBusinessInfo] = useState(initialBusinessInfo);
  const [businessProfile, setBusinessProfile] = useState(initialBusinessProfile);
  const [paymentInfo, setPaymentInfo] = useState(initialPaymentInfo);
  const [stripeCustomerId, setStripeCustomerId] = useState('');
  const [stripeSubscriptionId, setStripeSubscriptionId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signUp, isAuthenticated } = useAuth();

  // Redirect if already authenticated
  if (isAuthenticated) {
    router.push('/dashboard');
    return null;
  }

  const toggleBusinessGoal = (goal: string) => {
    setBusinessProfile(prev => ({
      ...prev,
      businessGoals: prev.businessGoals.includes(goal)
        ? prev.businessGoals.filter(g => g !== goal)
        : [...prev.businessGoals, goal]
    }));
  };

  const toggleTargetAudience = (audience: string) => {
    setBusinessProfile(prev => ({
      ...prev,
      targetAudience: prev.targetAudience.includes(audience)
        ? prev.targetAudience.filter(a => a !== audience)
        : [...prev.targetAudience, audience]
    }));
  };

  const handlePaymentSuccess = (customerId: string, subscriptionId: string) => {
    setStripeCustomerId(customerId);
    setStripeSubscriptionId(subscriptionId);
    setCurrentStep(currentStep + 1);
  };

  const handlePaymentError = (message: string) => {
    setError(message);
  };

  const nextStep = async () => {
    setError('');

    if (currentStep === 1) {
      // Validate business info only
      if (!businessInfo.email || !businessInfo.password) {
        setError('Email and password are required');
        return;
      }

      if (!businessInfo.businessName || !businessInfo.ownerName) {
        setError('Business name and owner name are required');
        return;
      }

      setCurrentStep(currentStep + 1);
      return;
    }

    if (currentStep === 2) {
      // Payment will be handled by the PaymentForm component
      // Don't advance step here - PaymentForm will call handlePaymentSuccess
      return;
    }

    if (currentStep === 3) {
      // Validate business profile and create account with all collected info
      if (!businessProfile.address) {
        setError('Business address is required');
        return;
      }

      setLoading(true);

      try {
        // Create account with all collected information
        const { error: authError } = await signUp(businessInfo.email, businessInfo.password, {
          business_name: businessInfo.businessName,
          owner_name: businessInfo.ownerName,
          industry: businessInfo.industry,
          phone: businessInfo.phone,
          promo_code: businessInfo.promoCode,
          address: businessProfile.address,
          target_radius: businessProfile.targetRadius,
          business_goals: businessProfile.businessGoals,
          target_age: businessProfile.targetAge,
          target_audience: businessProfile.targetAudience,
          stripe_customer_id: stripeCustomerId,
          stripe_subscription_id: stripeSubscriptionId
        });

        if (authError) {
          setError(authError.message);
          setLoading(false);
          return;
        }

        // If signup successful, move to welcome step
        setLoading(false);
        setCurrentStep(currentStep + 1);

      } catch (err) {
        setError('An unexpected error occurred. Please try again.');
        setLoading(false);
      }

      return;
    }

    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center space-x-4 mb-8">
      {[1, 2, 3, 4].map((step) => (
        <div key={step} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step <= currentStep
            ? 'bg-primary text-white'
            : 'bg-muted text-muted-foreground'
            }`}>
            {step}
          </div>
          {step < 4 && (
            <div className={`w-12 h-0.5 ${step < currentStep ? 'bg-primary' : 'bg-muted'
              }`} />
          )}
        </div>
      ))}
    </div>
  );

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
            <h1 className="text-3xl font-bold">Get Started</h1>
            <p className="text-muted-foreground">Step {currentStep} of 4</p>
          </div>

          {renderStepIndicator()}

          {/* Step 1: Business Information */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
                <CardDescription>
                  Tell us about your business to get started
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name</Label>
                    <Input
                      id="businessName"
                      placeholder="Your Business Name"
                      value={businessInfo.businessName}
                      onChange={(e) => setBusinessInfo({ ...businessInfo, businessName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ownerName">Owner Name</Label>
                    <Input
                      id="ownerName"
                      placeholder="Your Full Name"
                      value={businessInfo.ownerName}
                      onChange={(e) => setBusinessInfo({ ...businessInfo, ownerName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Business Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="business@example.com"
                    value={businessInfo.email}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, email: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a secure password"
                    value={businessInfo.password}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, password: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select onValueChange={(value) => setBusinessInfo({ ...businessInfo, industry: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map((industry) => (
                        <SelectItem key={industry.value} value={industry.value}>
                          <div className="flex items-center space-x-2">
                            <industry.icon className="h-4 w-4" />
                            <span>{industry.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={businessInfo.phone}
                      onChange={(e) => setBusinessInfo({ ...businessInfo, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="promoCode">Promo Code (Optional)</Label>
                    <Input
                      id="promoCode"
                      placeholder="Enter code"
                      value={businessInfo.promoCode}
                      onChange={(e) => setBusinessInfo({ ...businessInfo, promoCode: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
              <div className="p-6 pt-0">
                <div className="flex justify-between">
                  <Button variant="outline" onClick={prevStep} disabled={currentStep === 1}>
                    Previous
                  </Button>
                  <Button onClick={nextStep} disabled={loading}>
                    Continue
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Step 2: Platform Subscription */}
          {currentStep === 2 && (
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
                    email={businessInfo.email}
                    name={businessInfo.ownerName}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                    loading={loading}
                    setLoading={setLoading}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={paymentInfo.termsAccepted}
                    onCheckedChange={(checked) => setPaymentInfo({ ...paymentInfo, termsAccepted: !!checked })}
                  />
                  <Label htmlFor="terms" className="text-sm">
                    I agree to the Terms of Service and Privacy Policy
                  </Label>
                </div>
              </CardContent>
              <div className="p-6 pt-0">
                <div className="flex justify-between">
                  <Button variant="outline" onClick={prevStep}>
                    Previous
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    Complete payment above to continue
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Step 3: Business Profile */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Business Profile</CardTitle>
                <CardDescription>
                  Help us understand your customers and goals
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="address">Business Address</Label>
                  <Input
                    id="address"
                    placeholder="123 Main St, City, State"
                    value={businessProfile.address}
                    onChange={(e) => setBusinessProfile({ ...businessProfile, address: e.target.value })}
                  />
                </div>

                <div className="space-y-4">
                  <Label>Target Radius: {businessProfile.targetRadius} miles</Label>
                  <Slider
                    value={[businessProfile.targetRadius]}
                    onValueChange={(value) => setBusinessProfile({ ...businessProfile, targetRadius: value[0] })}
                    max={50}
                    min={5}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>5 miles</span>
                    <span>50 miles</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Business Goals (Select all that apply)</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {businessGoals.map((goal) => (
                      <div
                        key={goal}
                        className={`p-3 border rounded-lg cursor-pointer transition-all ${businessProfile.businessGoals.includes(goal)
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border hover:border-primary/50'
                          }`}
                        onClick={() => toggleBusinessGoal(goal)}
                      >
                        <div className="flex items-center space-x-2">
                          <Checkbox checked={businessProfile.businessGoals.includes(goal)} />
                          <span className="text-sm font-medium">{goal}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Target Age Range: {businessProfile.targetAge[0]} - {businessProfile.targetAge[1]} years</Label>
                  <Slider
                    value={businessProfile.targetAge}
                    onValueChange={(value) => setBusinessProfile({ ...businessProfile, targetAge: value as [number, number] })}
                    max={70}
                    min={18}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>18 years</span>
                    <span>70+ years</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Target Audience (Select all that apply)</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {targetAudiences.map((audience) => (
                      <div
                        key={audience}
                        className={`p-3 border rounded-lg cursor-pointer transition-all ${businessProfile.targetAudience.includes(audience)
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border hover:border-primary/50'
                          }`}
                        onClick={() => toggleTargetAudience(audience)}
                      >
                        <div className="flex items-center space-x-2">
                          <Checkbox checked={businessProfile.targetAudience.includes(audience)} />
                          <span className="text-sm font-medium">{audience}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
              <div className="p-6 pt-0">
                <div className="flex justify-between">
                  <Button variant="outline" onClick={prevStep} disabled={loading}>
                    Previous
                  </Button>
                  <Button onClick={nextStep} disabled={loading}>
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Step 4: Welcome & Next Steps */}
          {currentStep === 4 && (
            <Card>
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl">Welcome to AdsCampaign!</CardTitle>
                <CardDescription>
                  Your account is ready. Here's what happens next:
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {[
                    {
                      icon: <Check className="h-5 w-5 text-success" />,
                      title: "Account Created",
                      description: "Your business profile is set up and ready"
                    },
                    {
                      icon: <Check className="h-5 w-5 text-success" />,
                      title: "Platform Access",
                      description: "You now have full access to the campaign builder"
                    },
                    {
                      icon: <Building2 className="h-5 w-5 text-primary" />,
                      title: "Build Your First Campaign",
                      description: "Create your Google Ads campaign in 15 minutes"
                    },
                    {
                      icon: <Zap className="h-5 w-5 text-warning" />,
                      title: "Set Budget & Launch",
                      description: "Choose your advertising budget when ready"
                    }
                  ].map((step, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full border-2 border-primary/20 flex items-center justify-center">
                        {step.icon}
                      </div>
                      <div>
                        <h4 className="font-medium">{step.title}</h4>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Zap className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-primary">No Rush on Budget</p>
                      <p className="text-sm text-muted-foreground">
                        Take your time to build and perfect your campaigns. You can explore all features before setting an advertising budget.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Button variant="outline" className="flex-1">
                    Take a Tour
                  </Button>
                  <Button variant="cta" className="flex-1">
                    Start Building
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </StripeProvider>
  );
};

export default Signup;