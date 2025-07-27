'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { User, Mail, Phone, MapPin, Calendar, Shield, CreditCard, Camera, Edit3, CheckCircle } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';

const Profile = () => {
    const { user, signOut, isAuthenticated, loading } = useAuth();
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const {
        profileData,
        handleInputChange,
        handleSave,
        loading: profileLoading,
        error,
        success
    } = useProfile(user);

    const handleSignOut = async () => {
        await signOut();
        router.push('/');
    };

    // Show loading state while checking authentication or profile
    if (loading || profileLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    // Redirect if not authenticated
    if (!isAuthenticated) {
        router.push('/login');
        return null;
    }

    return (
        <>
            <div className="container mx-auto p-4">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">Profile</h1>
                    <div className="flex space-x-2">
                        <Button onClick={() => setIsEditing(!isEditing)} variant="outline" className="flex items-center space-x-2">
                            <Edit3 className="h-4 w-4" />
                            <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
                        </Button>
                        {isEditing && (
                            <Button onClick={async () => { await handleSave(); setIsEditing(false); }}>
                                Save
                            </Button>
                        )}
                        <Button onClick={handleSignOut} variant="destructive">
                            Sign Out
                        </Button>
                    </div>
                </div>

                {/* Alert Messages */}
                {success && (
                    <Alert className="mb-4 border-success/20 bg-success/10">
                        <CheckCircle className="h-4 w-4 text-success" />
                        <AlertDescription className="text-success">{success}</AlertDescription>
                    </Alert>
                )}

                {error && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column - Profile Overview */}
                    <div className="space-y-6">
                        {/* Profile Card */}
                        <Card className="shadow-elegant">
                            <CardHeader className="text-center">
                                <div className="relative mx-auto mb-4">
                                    <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                        {profileData.ownerName ? profileData.ownerName.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                                        disabled={!isEditing}
                                    >
                                        <Camera className="h-4 w-4" />
                                    </Button>
                                </div>
                                <CardTitle className="text-xl">{profileData.ownerName || 'User'}</CardTitle>
                                <CardDescription>{profileData.businessName || 'Business Owner'}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center space-x-3 text-sm">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span>{profileData.email}</span>
                                </div>
                                {profileData.phone && (
                                    <div className="flex items-center space-x-3 text-sm">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <span>{profileData.phone}</span>
                                    </div>
                                )}
                                {profileData.address && (
                                    <div className="flex items-center space-x-3 text-sm">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        <span>{profileData.address}</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Profile Details */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="shadow-elegant">
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <User className="h-5 w-5" />
                                    <span>Personal Information</span>
                                </CardTitle>
                                <CardDescription>
                                    Update your personal details and contact information
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="ownerName">Full Name</Label>
                                        <Input
                                            id="ownerName"
                                            value={profileData.ownerName}
                                            onChange={(e) => handleInputChange('ownerName', e.target.value)}
                                            disabled={!isEditing}
                                            placeholder="Enter your full name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={profileData.email}
                                            disabled
                                            className="bg-muted/50"
                                        />
                                        <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <Input
                                            id="phone"
                                            value={profileData.phone}
                                            onChange={(e) => handleInputChange('phone', e.target.value)}
                                            disabled={!isEditing}
                                            placeholder="(555) 123-4567"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="industry">Industry</Label>
                                        <Input
                                            id="industry"
                                            value={profileData.industry}
                                            onChange={(e) => handleInputChange('industry', e.target.value)}
                                            disabled={!isEditing}
                                            placeholder="Enter industry"
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="businessName">Business Name</Label>
                                        <Input
                                            id="businessName"
                                            value={profileData.businessName}
                                            onChange={(e) => handleInputChange('businessName', e.target.value)}
                                            disabled={!isEditing}
                                            placeholder="Enter business name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="businessGoals">Business Goals</Label>
                                        <Input
                                            id="businessGoals"
                                            value={profileData.businessGoals}
                                            onChange={(e) => handleInputChange('businessGoals', e.target.value)}
                                            disabled={!isEditing}
                                            placeholder="Comma separated goals"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="address">Address</Label>
                                    <Input
                                        id="address"
                                        value={profileData.address}
                                        onChange={(e) => handleInputChange('address', e.target.value)}
                                        disabled={!isEditing}
                                        placeholder="Enter your address"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Profile;
