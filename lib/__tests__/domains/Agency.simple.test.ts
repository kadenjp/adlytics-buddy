// Mock the Supabase client
jest.mock('@/integrations/supabase/client', () => ({
    supabase: {
        from: jest.fn(() => ({
            select: jest.fn().mockReturnThis(),
            insert: jest.fn().mockReturnThis(),
            update: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn(),
            order: jest.fn().mockReturnThis(),
        })),
    }
}));

import { AgencyService } from '../../domains/Agency';
import { supabase } from '@/integrations/supabase/client';

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe('AgencyService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getByOwnerId', () => {
        it('should return agency data when found', async () => {
            const mockAgency = {
                id: 'agency-1',
                owner_id: 'user-1',
                name: 'Test Agency',
                is_active: true,
            };

            // Create a proper mock chain
            const mockChain = {
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({ data: mockAgency, error: null }),
            };

            mockSupabase.from.mockReturnValue(mockChain as any);

            const result = await AgencyService.getByOwnerId('user-1');

            expect(result).toEqual(mockAgency);
            expect(mockSupabase.from).toHaveBeenCalledWith('agencies');
        });

        it('should return null when agency not found', async () => {
            const mockChain = {
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: null,
                    error: { code: 'PGRST116', message: 'No rows found' }
                }),
            };

            mockSupabase.from.mockReturnValue(mockChain as any);

            const result = await AgencyService.getByOwnerId('user-1');

            expect(result).toBeNull();
        });

        it('should throw error for database errors', async () => {
            const mockChain = {
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: null,
                    error: { code: 'OTHER_ERROR', message: 'Database error' }
                }),
            };

            mockSupabase.from.mockReturnValue(mockChain as any);

            await expect(AgencyService.getByOwnerId('user-1')).rejects.toThrow('Failed to fetch agency: Database error');
        });
    });

    describe('create', () => {
        it('should create and return new agency', async () => {
            const agencyData = {
                owner_id: 'user-1',
                name: 'New Agency',
                description: 'A test agency',
            };

            const mockCreatedAgency = {
                id: 'agency-1',
                ...agencyData,
                created_at: new Date().toISOString(),
            };

            const mockChain = {
                insert: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({ data: mockCreatedAgency, error: null }),
            };

            mockSupabase.from.mockReturnValue(mockChain as any);

            const result = await AgencyService.create(agencyData);

            expect(result).toEqual(mockCreatedAgency);
            expect(mockSupabase.from).toHaveBeenCalledWith('agencies');
        });

        it('should throw error when creation fails', async () => {
            const agencyData = {
                owner_id: 'user-1',
                name: 'New Agency',
            };

            const mockChain = {
                insert: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Creation failed' }
                }),
            };

            mockSupabase.from.mockReturnValue(mockChain as any);

            await expect(AgencyService.create(agencyData)).rejects.toThrow('Failed to create agency: Creation failed');
        });
    });
});
