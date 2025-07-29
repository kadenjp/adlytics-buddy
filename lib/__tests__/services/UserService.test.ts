import { UserService } from '../../services/UserService';
import { IUserInformationDatabase } from '../../interfaces/IUserInformationDatabase';
import { IBusinessProfileDatabase } from '../../interfaces/IBusinessProfileDatabase';

// Mock the database interfaces
const mockUserInformationDb: jest.Mocked<IUserInformationDatabase> = {
    getUserInformation: jest.fn(),
    upsertUserInformation: jest.fn(),
    updateUserInformation: jest.fn(),
    deleteUserInformation: jest.fn(),
};

const mockBusinessProfileDb: jest.Mocked<IBusinessProfileDatabase> = {
    getBusinessProfile: jest.fn(),
    upsertBusinessProfile: jest.fn(),
    updateBusinessProfile: jest.fn(),
    deleteBusinessProfile: jest.fn(),
};

describe('UserService', () => {
    let userService: UserService;

    beforeEach(() => {
        jest.clearAllMocks();
        userService = new UserService(mockUserInformationDb, mockBusinessProfileDb);
    });

    describe('getUserProfile', () => {
        it('should return complete user profile with personal and business information', async () => {
            const mockPersonalInfo = {
                id: 'user-1',
                email: 'user@example.com',
                first_name: 'John',
                last_name: 'Doe',
            };

            const mockBusinessProfile = {
                id: 'business-1',
                user_id: 'user-1',
                business_name: 'Test Business',
                industry: 'Technology',
            };

            mockUserInformationDb.getUserInformation.mockResolvedValue(mockPersonalInfo);
            mockBusinessProfileDb.getBusinessProfile.mockResolvedValue(mockBusinessProfile);

            const result = await userService.getUserProfile('user-1');

            expect(result).toEqual({
                personal: mockPersonalInfo,
                business: mockBusinessProfile,
                agencies: [],
                clients: [],
            });
            expect(mockUserInformationDb.getUserInformation).toHaveBeenCalledWith('user-1');
            expect(mockBusinessProfileDb.getBusinessProfile).toHaveBeenCalledWith('user-1');
        });

        it('should return null when personal information is not found', async () => {
            mockUserInformationDb.getUserInformation.mockResolvedValue(null);

            const result = await userService.getUserProfile('user-1');

            expect(result).toBeNull();
            expect(mockUserInformationDb.getUserInformation).toHaveBeenCalledWith('user-1');
        });

        it('should return profile with null business when business profile is not found', async () => {
            const mockPersonalInfo = {
                id: 'user-1',
                email: 'user@example.com',
                first_name: 'John',
                last_name: 'Doe',
            };

            mockUserInformationDb.getUserInformation.mockResolvedValue(mockPersonalInfo);
            mockBusinessProfileDb.getBusinessProfile.mockResolvedValue(null);

            const result = await userService.getUserProfile('user-1');

            expect(result).toEqual({
                personal: mockPersonalInfo,
                business: null,
                agencies: [],
                clients: [],
            });
        });

        it('should handle and rethrow errors', async () => {
            const error = new Error('Database error');
            mockUserInformationDb.getUserInformation.mockRejectedValue(error);

            await expect(userService.getUserProfile('user-1')).rejects.toThrow('Database error');
        });
    });

    describe('upsertUserInformation', () => {
        it('should create or update user information', async () => {
            const userData = {
                first_name: 'John',
                last_name: 'Doe',
                phone: '123-456-7890',
            };

            const mockResult = {
                id: 'user-1',
                email: 'user@example.com',
                ...userData,
            };

            mockUserInformationDb.upsertUserInformation.mockResolvedValue(mockResult);

            const result = await userService.upsertUserInformation('user-1', userData);

            expect(result).toEqual(mockResult);
            expect(mockUserInformationDb.upsertUserInformation).toHaveBeenCalledWith('user-1', userData);
        });

        it('should handle and rethrow errors', async () => {
            const error = new Error('Upsert failed');
            mockUserInformationDb.upsertUserInformation.mockRejectedValue(error);

            await expect(userService.upsertUserInformation('user-1', {})).rejects.toThrow('Upsert failed');
        });
    });

    describe('upsertBusinessProfile', () => {
        it('should create or update business profile', async () => {
            const businessData = {
                business_name: 'Test Business',
                industry: 'Technology',
                website: 'https://example.com',
            };

            const mockResult = {
                id: 'business-1',
                user_id: 'user-1',
                ...businessData,
            };

            mockBusinessProfileDb.upsertBusinessProfile.mockResolvedValue(mockResult);

            const result = await userService.upsertBusinessProfile('user-1', businessData);

            expect(result).toEqual(mockResult);
            expect(mockBusinessProfileDb.upsertBusinessProfile).toHaveBeenCalledWith('user-1', businessData);
        });

        it('should handle and rethrow errors', async () => {
            const error = new Error('Upsert failed');
            mockBusinessProfileDb.upsertBusinessProfile.mockRejectedValue(error);

            await expect(userService.upsertBusinessProfile('user-1', {})).rejects.toThrow('Upsert failed');
        });
    });

    describe('completeOnboarding', () => {
        it('should complete onboarding with both personal and business data', async () => {
            const onboardingData = {
                personal: {
                    first_name: 'John',
                    last_name: 'Doe',
                    email: 'john@example.com',
                    phone: '123-456-7890',
                },
                business: {
                    business_name: 'Test Business',
                    industry: 'Technology',
                    business_type: 'direct' as const,
                },
            };

            const mockPersonalInfo = {
                id: 'user-1',
                email: 'user@example.com',
                ...onboardingData.personal,
            };

            const mockBusinessProfile = {
                id: 'business-1',
                user_id: 'user-1',
                ...onboardingData.business,
            };

            mockUserInformationDb.upsertUserInformation.mockResolvedValue(mockPersonalInfo);
            mockBusinessProfileDb.upsertBusinessProfile.mockResolvedValue(mockBusinessProfile);

            const result = await userService.completeOnboarding('user-1', onboardingData);

            expect(result).toEqual({
                personal: mockPersonalInfo,
                business: mockBusinessProfile,
                agencies: [],
                clients: [],
            });
            expect(mockUserInformationDb.upsertUserInformation).toHaveBeenCalledWith('user-1', onboardingData.personal);
            expect(mockBusinessProfileDb.upsertBusinessProfile).toHaveBeenCalledWith('user-1', onboardingData.business);
        });

        it('should handle and rethrow errors', async () => {
            const error = new Error('Onboarding failed');
            mockUserInformationDb.upsertUserInformation.mockRejectedValue(error);

            const onboardingData = {
                personal: {
                    first_name: 'John',
                    last_name: 'Doe',
                    email: 'john@example.com',
                },
                business: {
                    business_name: 'Test',
                    industry: 'Technology',
                    business_type: 'direct' as const,
                },
            };

            await expect(userService.completeOnboarding('user-1', onboardingData)).rejects.toThrow('Onboarding failed');
        });
    });

    describe('getUserWithRelationships', () => {
        it('should return user with all relationships', async () => {
            const mockPersonalInfo = {
                id: 'user-1',
                email: 'user@example.com',
                first_name: 'John',
                last_name: 'Doe',
            };

            const mockBusinessProfile = {
                id: 'business-1',
                user_id: 'user-1',
                business_name: 'Test Business',
            };

            mockUserInformationDb.getUserInformation.mockResolvedValue(mockPersonalInfo);
            mockBusinessProfileDb.getBusinessProfile.mockResolvedValue(mockBusinessProfile);

            const result = await userService.getUserWithRelationships('user-1');

            expect(result).toEqual({
                id: 'user-1',
                email: mockPersonalInfo.email,
                personal_info: mockPersonalInfo,
                business_profile: mockBusinessProfile,
                owned_agencies: [],
                client_profiles: [],
                agency_relationships: [],
            });
        });

        it('should return null when profile is not found', async () => {
            mockUserInformationDb.getUserInformation.mockResolvedValue(null);

            const result = await userService.getUserWithRelationships('user-1');

            expect(result).toBeNull();
        });

        it('should handle and rethrow errors', async () => {
            const error = new Error('Fetch failed');
            mockUserInformationDb.getUserInformation.mockRejectedValue(error);

            await expect(userService.getUserWithRelationships('user-1')).rejects.toThrow('Fetch failed');
        });
    });

    describe('updateUserInformation', () => {
        it('should update user information', async () => {
            const updates = {
                first_name: 'Jane',
                phone: '987-654-3210',
            };

            const mockResult = {
                id: 'user-1',
                email: 'user@example.com',
                ...updates,
            };

            mockUserInformationDb.updateUserInformation.mockResolvedValue(mockResult);

            const result = await userService.updateUserInformation('user-1', updates);

            expect(result).toEqual(mockResult);
            expect(mockUserInformationDb.updateUserInformation).toHaveBeenCalledWith('user-1', updates);
        });

        it('should handle and rethrow errors', async () => {
            const error = new Error('Update failed');
            mockUserInformationDb.updateUserInformation.mockRejectedValue(error);

            await expect(userService.updateUserInformation('user-1', {})).rejects.toThrow('Update failed');
        });
    });

    describe('updateBusinessProfile', () => {
        it('should update business profile', async () => {
            const updates = {
                business_name: 'Updated Business',
                website: 'https://updated.com',
            };

            mockBusinessProfileDb.updateBusinessProfile.mockResolvedValue();

            await userService.updateBusinessProfile('user-1', updates);

            expect(mockBusinessProfileDb.updateBusinessProfile).toHaveBeenCalledWith('user-1', updates);
        });

        it('should handle and rethrow errors', async () => {
            const error = new Error('Update failed');
            mockBusinessProfileDb.updateBusinessProfile.mockRejectedValue(error);

            await expect(userService.updateBusinessProfile('user-1', {})).rejects.toThrow('Update failed');
        });
    });

    describe('deleteUserData', () => {
        it('should delete both business profile and user information', async () => {
            mockBusinessProfileDb.deleteBusinessProfile.mockResolvedValue();
            mockUserInformationDb.deleteUserInformation.mockResolvedValue();

            await userService.deleteUserData('user-1');

            expect(mockBusinessProfileDb.deleteBusinessProfile).toHaveBeenCalledWith('user-1');
            expect(mockUserInformationDb.deleteUserInformation).toHaveBeenCalledWith('user-1');
        });

        it('should handle and rethrow errors', async () => {
            const error = new Error('Deletion failed');
            mockBusinessProfileDb.deleteBusinessProfile.mockRejectedValue(error);

            await expect(userService.deleteUserData('user-1')).rejects.toThrow('Deletion failed');
        });
    });
});
