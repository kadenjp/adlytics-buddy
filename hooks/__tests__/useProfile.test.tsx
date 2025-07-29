import { renderHook, act, waitFor } from '@testing-library/react';
import { useProfile } from '../useProfile';

// Mock UserService
const mockGetUserProfile = jest.fn();
const mockUpdateUserInformation = jest.fn();
const mockUpdateBusinessProfile = jest.fn();

jest.mock('@/lib/services/UserService', () => ({
  UserService: jest.fn().mockImplementation(() => ({
    getUserProfile: mockGetUserProfile,
    updateUserInformation: mockUpdateUserInformation,
    updateBusinessProfile: mockUpdateBusinessProfile,
  })),
}));

// Mock database providers
jest.mock('@/lib/providers/supabase/SupabaseUserInformationDatabaseProvider', () => ({
  supabaseUserInformationDatabase: {},
}));

jest.mock('@/lib/providers/supabase/SupabaseBusinessProfileDatabaseProvider', () => ({
  supabaseBusinessProfileDatabase: {},
}));

describe('useProfile', () => {
  const mockUser = {
    id: 'user123',
    email: 'test@example.com',
  };

  const mockProfileData = {
    personal: {
      first_name: 'John',
      last_name: 'Doe',
      phone: '+1234567890',
    },
    business: {
      business_name: 'Test Business',
      industry: 'Technology',
      business_address: '123 Main St',
      business_goals: ['Growth', 'Expansion'],
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with default profile data', () => {
      const { result } = renderHook(() => useProfile(null));

      expect(result.current.profileData).toEqual({
        email: '',
        ownerName: '',
        businessName: '',
        industry: '',
        phone: '',
        address: '',
        businessGoals: '',
      });
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe('');
      expect(result.current.success).toBe('');
    });

    it('should not load profile when user is null', () => {
      renderHook(() => useProfile(null));

      expect(mockGetUserProfile).not.toHaveBeenCalled();
    });
  });

  describe('profile loading', () => {
    it('should load user profile on mount', async () => {
      mockGetUserProfile.mockResolvedValue(mockProfileData);

      const { result } = renderHook(() => useProfile(mockUser));

      // Wait for the async operation to complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockGetUserProfile).toHaveBeenCalledWith('user123');
      expect(result.current.profileData).toEqual({
        email: 'test@example.com',
        ownerName: 'John Doe',
        businessName: 'Test Business',
        industry: 'Technology',
        phone: '+1234567890',
        address: '123 Main St',
        businessGoals: 'Growth, Expansion',
      });
    });

    it('should handle missing profile data gracefully', async () => {
      mockGetUserProfile.mockResolvedValue({
        personal: null,
        business: null,
      });

      const { result } = renderHook(() => useProfile(mockUser));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.profileData).toEqual({
        email: 'test@example.com',
        ownerName: '',
        businessName: '',
        industry: '',
        phone: '',
        address: '',
        businessGoals: '',
      });
    });

    it('should handle partial profile data', async () => {
      mockGetUserProfile.mockResolvedValue({
        personal: {
          first_name: 'John',
          // Missing last_name and phone
        },
        business: {
          business_name: 'Test Business',
          // Missing other fields
        },
      });

      const { result } = renderHook(() => useProfile(mockUser));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.profileData).toEqual({
        email: 'test@example.com',
        ownerName: 'John',
        businessName: 'Test Business',
        industry: '',
        phone: '',
        address: '',
        businessGoals: '',
      });
    });

    it('should set error when profile loading fails', async () => {
      mockGetUserProfile.mockRejectedValue(new Error('Failed to load'));

      const { result } = renderHook(() => useProfile(mockUser));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Failed to load profile. Please try again.');
    });
  });

  describe('profile updating', () => {
    it('should update profile successfully', async () => {
      mockGetUserProfile.mockResolvedValue(mockProfileData);
      mockUpdateUserInformation.mockResolvedValue({});
      mockUpdateBusinessProfile.mockResolvedValue({});

      const { result } = renderHook(() => useProfile(mockUser));

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Update profile data
      act(() => {
        result.current.handleInputChange('ownerName', 'Jane Smith');
        result.current.handleInputChange('businessName', 'New Business');
      });

      // Save profile
      await act(async () => {
        await result.current.handleSave();
      });

      expect(mockUpdateUserInformation).toHaveBeenCalledWith('user123', {
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'test@example.com',
        phone: '+1234567890',
      });

      expect(mockUpdateBusinessProfile).toHaveBeenCalledWith('user123', {
        business_name: 'New Business',
        industry: 'Technology',
        business_address: '123 Main St',
        business_goals: ['Growth', 'Expansion'],
      });

      expect(result.current.success).toBe('Profile updated successfully!');
      expect(result.current.loading).toBe(false);
    });

    it('should handle single name in ownerName', async () => {
      mockGetUserProfile.mockResolvedValue(mockProfileData);
      mockUpdateUserInformation.mockResolvedValue({});
      mockUpdateBusinessProfile.mockResolvedValue({});

      const { result } = renderHook(() => useProfile(mockUser));

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Update with single name
      act(() => {
        result.current.handleInputChange('ownerName', 'Madonna');
      });

      await act(async () => {
        await result.current.handleSave();
      });

      expect(mockUpdateUserInformation).toHaveBeenCalledWith('user123', {
        first_name: 'Madonna',
        last_name: '',
        email: 'test@example.com',
        phone: '+1234567890',
      });
    });

    it('should parse business goals correctly', async () => {
      mockGetUserProfile.mockResolvedValue(mockProfileData);
      mockUpdateUserInformation.mockResolvedValue({});
      mockUpdateBusinessProfile.mockResolvedValue({});

      const { result } = renderHook(() => useProfile(mockUser));

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Update business goals
      act(() => {
        result.current.handleInputChange('businessGoals', 'Goal 1, Goal 2, Goal 3');
      });

      await act(async () => {
        await result.current.handleSave();
      });

      expect(mockUpdateBusinessProfile).toHaveBeenCalledWith('user123', expect.objectContaining({
        business_goals: ['Goal 1', 'Goal 2', 'Goal 3'],
      }));
    });

    it('should handle save errors', async () => {
      mockGetUserProfile.mockResolvedValue(mockProfileData);
      mockUpdateUserInformation.mockRejectedValue(new Error('Update failed'));

      const { result } = renderHook(() => useProfile(mockUser));

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.handleSave();
      });

      expect(result.current.error).toBe('Failed to update profile. Please try again.');
      expect(result.current.loading).toBe(false);
    });

    it('should not save when user is null', async () => {
      const { result } = renderHook(() => useProfile(null));

      await act(async () => {
        await result.current.handleSave();
      });

      expect(mockUpdateUserInformation).not.toHaveBeenCalled();
      expect(mockUpdateBusinessProfile).not.toHaveBeenCalled();
    });
  });

  describe('input handling', () => {
    it('should update profile data when handleInputChange is called', () => {
      const { result } = renderHook(() => useProfile(mockUser));

      act(() => {
        result.current.handleInputChange('email', 'new@example.com');
        result.current.handleInputChange('businessName', 'Updated Business');
      });

      expect(result.current.profileData.email).toBe('new@example.com');
      expect(result.current.profileData.businessName).toBe('Updated Business');
    });
  });

  describe('state setters', () => {
    it('should allow setting error and success messages', () => {
      const { result } = renderHook(() => useProfile(mockUser));

      act(() => {
        result.current.setError('Test error');
        result.current.setSuccess('Test success');
      });

      expect(result.current.error).toBe('Test error');
      expect(result.current.success).toBe('Test success');
    });

    it('should allow setting profile data directly', () => {
      const { result } = renderHook(() => useProfile(mockUser));

      const newProfileData = {
        email: 'direct@example.com',
        ownerName: 'Direct User',
        businessName: 'Direct Business',
        industry: 'Direct Industry',
        phone: '555-0123',
        address: 'Direct Address',
        businessGoals: 'Direct Goals',
      };

      act(() => {
        result.current.setProfileData(newProfileData);
      });

      expect(result.current.profileData).toEqual(newProfileData);
    });
  });
});
