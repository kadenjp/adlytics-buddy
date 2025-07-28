'use client'

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Building2, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface WelcomeStepProps {
    loading: boolean;
}

export const WelcomeStep = ({ loading: _loading }: WelcomeStepProps) => {
    const router = useRouter();

    return (
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
                            title: "Account Created & Payment Processed",
                            description: "Your business profile is set up and subscription is active"
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
                    <Button variant="outline" className="flex-1" onClick={() => router.push('/dashboard')}>
                        Take a Tour
                    </Button>
                    <Button variant="cta" className="flex-1" onClick={() => router.push('/dashboard')}>
                        Start Building
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
