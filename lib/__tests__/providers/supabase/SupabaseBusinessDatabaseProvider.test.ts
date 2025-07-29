import { supabaseBusinessDatabase } from '../../../providers/supabase/SupabaseBusinessDatabaseProvider';

// Mock the Supabase client
jest.mock('@/integrations/supabase/client', () => ({
    supabase: {
        from: jest.fn(() => ({
            select: jest.fn(() => ({
                eq: jest.fn(() => ({
                    single: jest.fn(),
                })),
            })),
            update: jest.fn(() => ({
                eq: jest.fn(),
            })),
        })),
    },
}));

import { supabase } from '@/integrations/supabase/client';

describe('SupabaseBusinessDatabaseProvider', () => {
    let mockSupabase: jest.Mocked<typeof supabase>;

    beforeEach(() => {
        jest.clearAllMocks();
        mockSupabase = supabase as jest.Mocked<typeof supabase>;
    });

    describe('getBusinessByEmail', () => {
        it('should return business data when found', async () => {
            const email = 'test@example.com';
            const businessData = { stripe_customer_id: 'cus_123' };

            const mockSingle = jest.fn().mockResolvedValue({
                data: businessData,
                error: null,
            });

            const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
            const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
            mockSupabase.from.mockReturnValue({ select: mockSelect } as any);

            const result = await supabaseBusinessDatabase.getBusinessByEmail(email);

            expect(result).toEqual(businessData);
            expect(mockSupabase.from).toHaveBeenCalledWith('businesses');
            expect(mockSelect).toHaveBeenCalledWith('stripe_customer_id');
            expect(mockEq).toHaveBeenCalledWith('name', email);
            expect(mockSingle).toHaveBeenCalled();
        });

        it('should return null when business not found', async () => {
            const email = 'notfound@example.com';

            const mockSingle = jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Not found' },
            });

            const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
            const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
            mockSupabase.from.mockReturnValue({ select: mockSelect } as any);

            const result = await supabaseBusinessDatabase.getBusinessByEmail(email);

            expect(result).toBeNull();
        });

        it('should return null when there is an error', async () => {
            const email = 'error@example.com';

            const mockSingle = jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Database error' },
            });

            const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
            const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
            mockSupabase.from.mockReturnValue({ select: mockSelect } as any);

            const result = await supabaseBusinessDatabase.getBusinessByEmail(email);

            expect(result).toBeNull();
        });
    });

    describe('getBusinessById', () => {
        it('should return business data when found', async () => {
            const id = 'biz_123';
            const businessData = { stripe_customer_id: 'cus_123' };

            const mockSingle = jest.fn().mockResolvedValue({
                data: businessData,
                error: null,
            });

            const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
            const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
            mockSupabase.from.mockReturnValue({ select: mockSelect } as any);

            const result = await supabaseBusinessDatabase.getBusinessById(id);

            expect(result).toEqual(businessData);
            expect(mockSupabase.from).toHaveBeenCalledWith('businesses');
            expect(mockSelect).toHaveBeenCalledWith('stripe_customer_id');
            expect(mockEq).toHaveBeenCalledWith('id', id);
            expect(mockSingle).toHaveBeenCalled();
        });

        it('should return null when business not found', async () => {
            const id = 'notfound_123';

            const mockSingle = jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Not found' },
            });

            const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
            const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
            mockSupabase.from.mockReturnValue({ select: mockSelect } as any);

            const result = await supabaseBusinessDatabase.getBusinessById(id);

            expect(result).toBeNull();
        });
    });

    describe('updateBusinessStripeCustomerId', () => {
        it('should update stripe customer id', async () => {
            const id = 'biz_123';
            const customerId = 'cus_new';

            const mockEq = jest.fn().mockResolvedValue({ data: null, error: null });
            const mockUpdate = jest.fn().mockReturnValue({ eq: mockEq });
            mockSupabase.from.mockReturnValue({ update: mockUpdate } as any);

            await supabaseBusinessDatabase.updateBusinessStripeCustomerId(id, customerId);

            expect(mockSupabase.from).toHaveBeenCalledWith('businesses');
            expect(mockUpdate).toHaveBeenCalledWith({ stripe_customer_id: customerId });
            expect(mockEq).toHaveBeenCalledWith('id', id);
        });

        it('should handle update errors gracefully', async () => {
            const id = 'biz_123';
            const customerId = 'cus_new';

            const mockEq = jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Update failed' }
            });
            const mockUpdate = jest.fn().mockReturnValue({ eq: mockEq });
            mockSupabase.from.mockReturnValue({ update: mockUpdate } as any);

            // Should not throw error
            await expect(supabaseBusinessDatabase.updateBusinessStripeCustomerId(id, customerId))
                .resolves.not.toThrow();
        });
    });
});
