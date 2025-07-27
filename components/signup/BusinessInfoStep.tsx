'use client'

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Building2, Utensils, Scale, Hammer, Stethoscope, ShoppingBag, Car, GraduationCap, Users } from 'lucide-react';

interface BusinessInfo {
    businessName: string;
    industry: string;
}

interface BusinessInfoStepProps {
    businessInfo: BusinessInfo;
    setBusinessInfo: (businessInfo: BusinessInfo | ((prev: BusinessInfo) => BusinessInfo)) => void;
    error: string;
    loading: boolean;
    onNext: () => void;
    onPrevious: () => void;
}

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

export const BusinessInfoStep = ({
    businessInfo,
    setBusinessInfo,
    error,
    loading,
    onNext,
    onPrevious
}: BusinessInfoStepProps) => {
    const validateAndNext = () => {
        if (!businessInfo.businessName) {
            return;
        }

        onNext();
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Business Information</CardTitle>
                <CardDescription>
                    Tell us about your business to customize your experience
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

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

                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                        <Building2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium text-primary">Why we need this:</p>
                            <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                                <li>• Get industry-specific campaign templates</li>
                                <li>• Receive targeted keyword suggestions</li>
                                <li>• See relevant examples and best practices</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </CardContent>
            <div className="p-6 pt-0">
                <div className="flex justify-between">
                    <Button variant="outline" onClick={onPrevious}>
                        Previous
                    </Button>
                    <Button onClick={validateAndNext} disabled={loading}>
                        Continue
                    </Button>
                </div>
            </div>
        </Card>
    );
};
