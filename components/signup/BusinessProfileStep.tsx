'use client'

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Zap } from 'lucide-react';

interface BusinessProfile {
    address: string;
    targetRadius: number;
    businessGoals: string[];
    targetAge: [number, number];
    targetAudience: string[];
}

interface BusinessProfileStepProps {
    businessProfile: BusinessProfile;
    setBusinessProfile: (businessProfile: BusinessProfile | ((prev: BusinessProfile) => BusinessProfile)) => void;
    error: string;
    loading: boolean;
    onNext: () => void;
    onPrevious: () => void;
    onSkip: () => void;
}

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

export const BusinessProfileStep = ({
    businessProfile,
    setBusinessProfile,
    error,
    loading,
    onNext,
    onPrevious,
    onSkip
}: BusinessProfileStepProps) => {
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

    return (
        <Card>
            <CardHeader>
                <CardTitle>Business Profile (Optional)</CardTitle>
                <CardDescription>
                    Help us customize your experience with business-specific insights and recommendations
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
                    <div className="flex items-start space-x-3">
                        <Zap className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium text-primary">How this helps you:</p>
                            <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                                <li>• Get industry-specific campaign templates</li>
                                <li>• Receive targeted keyword suggestions</li>
                                <li>• See relevant examples and best practices</li>
                                <li>• Get personalized optimization tips</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="address">Business Address (Optional)</Label>
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
                    <Label>Business Goals (Optional - Select any that apply)</Label>
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
                    <Label>Target Audience (Optional - Select any that apply)</Label>
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
                    <Button variant="outline" onClick={onPrevious}>
                        Previous
                    </Button>
                    <div className="flex space-x-2">
                        <Button variant="outline" onClick={onSkip} disabled={loading}>
                            Skip to Payment
                        </Button>
                        <Button onClick={onNext} disabled={loading}>
                            Continue to Payment
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    );
};
