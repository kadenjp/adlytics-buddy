'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface UserInfo {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string;
    promoCode: string;
}

interface UserInfoStepProps {
    userInfo: UserInfo;
    setUserInfo: (userInfo: UserInfo | ((prev: UserInfo) => UserInfo)) => void;
    error: string;
    loading: boolean;
    onNext: () => void;
    onPrevious: () => void;
    canGoBack: boolean;
}

export const UserInfoStep = ({
    userInfo,
    setUserInfo,
    error,
    loading,
    onNext,
    onPrevious,
    canGoBack
}: UserInfoStepProps) => {
    const validateAndNext = () => {
        if (!userInfo.email || !userInfo.password) {
            return;
        }

        if (!userInfo.firstName || !userInfo.lastName) {
            return;
        }

        onNext();
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Your Information</CardTitle>
                <CardDescription>
                    Tell us about yourself to create your account
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                            id="firstName"
                            placeholder="Your First Name"
                            value={userInfo.firstName}
                            onChange={(e) => setUserInfo({ ...userInfo, firstName: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                            id="lastName"
                            placeholder="Your Last Name"
                            value={userInfo.lastName}
                            onChange={(e) => setUserInfo({ ...userInfo, lastName: e.target.value })}
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={userInfo.email}
                        onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                        id="password"
                        type="password"
                        placeholder="Create a secure password"
                        value={userInfo.password}
                        onChange={(e) => setUserInfo({ ...userInfo, password: e.target.value })}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number (Optional)</Label>
                    <Input
                        id="phone"
                        type="tel"
                        placeholder="(555) 123-4567"
                        value={userInfo.phone}
                        onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="promoCode">Promo Code (Optional)</Label>
                    <Input
                        id="promoCode"
                        placeholder="Enter code"
                        value={userInfo.promoCode}
                        onChange={(e) => setUserInfo({ ...userInfo, promoCode: e.target.value })}
                    />
                </div>
            </CardContent>
            <div className="p-6 pt-0">
                <div className="flex justify-between">
                    <Button variant="outline" onClick={onPrevious} disabled={!canGoBack}>
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
