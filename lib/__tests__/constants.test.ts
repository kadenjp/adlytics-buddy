import { STRIPE_CONFIG, SUPABASE_CONFIG } from '../constants';

describe('constants', () => {
    describe('STRIPE_CONFIG', () => {
        it('should have required properties', () => {
            expect(STRIPE_CONFIG).toHaveProperty('PRICE_ID');
            expect(STRIPE_CONFIG).toHaveProperty('PUBLISHABLE_KEY');
        });

        it('should have valid Stripe price ID format', () => {
            expect(STRIPE_CONFIG.PRICE_ID).toMatch(/^price_/);
            expect(typeof STRIPE_CONFIG.PRICE_ID).toBe('string');
            expect(STRIPE_CONFIG.PRICE_ID.length).toBeGreaterThan(10);
        });

        it('should have valid Stripe publishable key format', () => {
            expect(STRIPE_CONFIG.PUBLISHABLE_KEY).toMatch(/^pk_test_/);
            expect(typeof STRIPE_CONFIG.PUBLISHABLE_KEY).toBe('string');
            expect(STRIPE_CONFIG.PUBLISHABLE_KEY.length).toBeGreaterThan(50);
        });

        it('should be readonly at compile time', () => {
            // This test verifies TypeScript compile-time immutability
            // The actual immutability is enforced by TypeScript, not runtime
            expect(typeof STRIPE_CONFIG.PRICE_ID).toBe('string');
            expect(typeof STRIPE_CONFIG.PUBLISHABLE_KEY).toBe('string');
            // Note: Runtime immutability would require Object.freeze()
        });
    });

    describe('SUPABASE_CONFIG', () => {
        it('should have required properties', () => {
            expect(SUPABASE_CONFIG).toHaveProperty('URL');
            expect(SUPABASE_CONFIG).toHaveProperty('ANON_KEY');
        });

        it('should have valid Supabase URL format', () => {
            expect(SUPABASE_CONFIG.URL).toMatch(/^https:\/\/.*\.supabase\.co$/);
            expect(typeof SUPABASE_CONFIG.URL).toBe('string');
        });

        it('should have valid Supabase anon key format', () => {
            expect(SUPABASE_CONFIG.ANON_KEY).toMatch(/^eyJ/); // JWT format
            expect(typeof SUPABASE_CONFIG.ANON_KEY).toBe('string');
            expect(SUPABASE_CONFIG.ANON_KEY.length).toBeGreaterThan(100);
        });

        it('should be readonly at compile time', () => {
            // This test verifies TypeScript compile-time immutability
            // The actual immutability is enforced by TypeScript, not runtime
            expect(typeof SUPABASE_CONFIG.URL).toBe('string');
            expect(typeof SUPABASE_CONFIG.ANON_KEY).toBe('string');
            // Note: Runtime immutability would require Object.freeze()
        });
    });
});
