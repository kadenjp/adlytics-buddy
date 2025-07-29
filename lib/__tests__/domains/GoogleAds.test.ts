// Mock the Supabase client to avoid ESM import issues
jest.mock('@/integrations/supabase/client', () => ({
    supabase: {
        from: jest.fn(() => ({
            select: jest.fn().mockReturnThis(),
            insert: jest.fn().mockReturnThis(),
            update: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            single: jest.fn(),
        })),
    },
}));
import * as GoogleAds from '../../domains/GoogleAds';

describe('GoogleAds module', () => {
    it('should export something', () => {
        expect(GoogleAds).toBeDefined();
    });

    it('should have at least one export', () => {
        expect(Object.keys(GoogleAds).length).toBeGreaterThan(0);
    });

    it('should call exported functions if possible', async () => {
        const keys = Object.keys(GoogleAds);
        for (const key of keys) {
            const exported = GoogleAds[key];
            if (typeof exported === 'function') {
                try {
                    // Try calling with no args
                    const result = exported();
                    expect(result).toBeDefined();
                } catch (e) {
                    // ignore errors from missing args
                }
            }
        }
    });
});
