import { useState, useEffect } from 'react';
import { UserService } from '@/lib/services/UserService';
import { supabaseUserInformationDatabase } from '@/lib/providers/SupabaseUserInformationDatabaseProvider';
import { supabaseBusinessProfileDatabase } from '@/lib/providers/SupabaseBusinessProfileDatabaseProvider';

export function useProfile(user) {
    const [profileData, setProfileData] = useState({
        email: '',
        ownerName: '',
        businessName: '',
        industry: '',
        phone: '',
        address: '',
        businessGoals: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (!user) return;
        setLoading(true);
        setError('');
        const userService = new UserService(
            supabaseUserInformationDatabase,
            supabaseBusinessProfileDatabase
        );
        const loadProfile = async () => {
            try {
                const profile = await userService.getUserProfile(user.id);
                setProfileData({
                    email: user.email || '',
                    ownerName: profile?.personal ? `${profile.personal.first_name || ''} ${profile.personal.last_name || ''}`.trim() : '',
                    businessName: profile?.business?.business_name || '',
                    industry: profile?.business?.industry || '',
                    phone: profile?.personal?.phone || '',
                    address: profile?.business?.business_address || '',
                    businessGoals: profile?.business?.business_goals ? profile.business.business_goals.join(', ') : ''
                });
            } catch (err) {
                setError('Failed to load profile. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        loadProfile();
    }, [user]);

    const handleSave = async () => {
        if (!user) return;
        setLoading(true);
        setError('');
        setSuccess('');
        const userService = new UserService(
            supabaseUserInformationDatabase,
            supabaseBusinessProfileDatabase
        );
        try {
            // Update user_information
            const [firstName, ...lastNameArr] = profileData.ownerName.split(' ');
            const lastName = lastNameArr.join(' ');
            await userService.updateUserInformation(user.id, {
                first_name: firstName,
                last_name: lastName,
                email: profileData.email,
                phone: profileData.phone
            });
            // Update business_profiles
            await userService.updateBusinessProfile(user.id, {
                business_name: profileData.businessName,
                industry: profileData.industry,
                business_address: profileData.address,
                business_goals: profileData.businessGoals.split(',').map(goal => goal.trim())
            });
            setSuccess('Profile updated successfully!');
        } catch (err) {
            setError('Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setProfileData((prev) => ({ ...prev, [field]: value }));
    };

    return {
        profileData,
        setProfileData,
        handleInputChange,
        handleSave,
        loading,
        error,
        success,
        setError,
        setSuccess
    };
}
