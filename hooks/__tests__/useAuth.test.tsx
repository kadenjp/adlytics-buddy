import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../useAuth';

// Create mock functions
const mockOnAuthStateChange = jest.fn();
const mockGetSession = jest.fn();
const mockSignUp = jest.fn();
const mockSignInWithPassword = jest.fn();
const mockSignOut = jest.fn();

// Mock Supabase client
jest.mock('@/integrations/supabase/client', () => ({
    supabase: {
        auth: {
            onAuthStateChange: mockOnAuthStateChange,
            getSession: mockGetSession,
            signUp: mockSignUp,
            signInWithPassword: mockSignInWithPassword,
            signOut: mockSignOut,
        },
    },
}));

// Mock window.location
Object.defineProperty(window, 'location', {
    value: {
        origin: 'http://localhost:3000',
    },
    writable: true,
});

describe('useAuth', () => {
    const mockUser = {
        id: '123',
        email: 'test@example.com',
        created_at: '2023-01-01T00:00:00Z',
        aud: 'authenticated',
        role: 'authenticated',
        updated_at: '2023-01-01T00:00:00Z',
        email_confirmed_at: '2023-01-01T00:00:00Z',
    };

    const mockSession = {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 3600,
        token_type: 'bearer',
        user: mockUser,
        expires_at: Date.now() + 3600000,
    };

    let mockAuthStateChangeCallback: (event: string, session: any) => void;
    const mockUnsubscribe = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();

        // Mock auth state change subscription
        mockOnAuthStateChange.mockImplementation((callback) => {
            mockAuthStateChangeCallback = callback;
            return {
                data: {
                    subscription: {
                        unsubscribe: mockUnsubscribe,
                    },
                },
            };
        });

        // Mock initial session check
        mockGetSession.mockResolvedValue({
            data: { session: null },
            error: null,
        });
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('initialization', () => {
        it('should initialize with loading state', () => {
            const { result } = renderHook(() => useAuth());

            expect(result.current.user).toBeNull();
            expect(result.current.session).toBeNull();
            expect(result.current.loading).toBe(true);
            expect(result.current.isAuthenticated).toBe(false);
        });

        it('should set up auth state listener and check existing session', async () => {
            renderHook(() => useAuth());

            expect(mockOnAuthStateChange).toHaveBeenCalledWith(
                expect.any(Function)
            );
            expect(mockGetSession).toHaveBeenCalled();
        });

        it('should clean up subscription on unmount', () => {
            const { unmount } = renderHook(() => useAuth());

            unmount();

            expect(mockUnsubscribe).toHaveBeenCalled();
        });
    });

    describe('auth state changes', () => {
        it('should update state when auth state changes with session', async () => {
            const { result } = renderHook(() => useAuth());

            await act(async () => {
                mockAuthStateChangeCallback('SIGNED_IN', mockSession);
            });

            expect(result.current.user).toEqual(mockUser);
            expect(result.current.session).toEqual(mockSession);
            expect(result.current.loading).toBe(false);
            expect(result.current.isAuthenticated).toBe(true);
        });

        it('should update state when auth state changes without session', async () => {
            const { result } = renderHook(() => useAuth());

            await act(async () => {
                mockAuthStateChangeCallback('SIGNED_OUT', null);
            });

            expect(result.current.user).toBeNull();
            expect(result.current.session).toBeNull();
            expect(result.current.loading).toBe(false);
            expect(result.current.isAuthenticated).toBe(false);
        });

        it('should handle existing session on mount', async () => {
            mockGetSession.mockResolvedValue({
                data: { session: mockSession },
                error: null,
            });

            const { result } = renderHook(() => useAuth());

            // Wait for the async getSession call
            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 0));
            });

            expect(result.current.user).toEqual(mockUser);
            expect(result.current.session).toEqual(mockSession);
            expect(result.current.loading).toBe(false);
            expect(result.current.isAuthenticated).toBe(true);
        });
    });

    describe('signUp', () => {
        it('should call supabase signUp with correct parameters', async () => {
            mockSignUp.mockResolvedValue({ error: null });

            const { result } = renderHook(() => useAuth());

            const email = 'test@example.com';
            const password = 'password123';
            const metadata = { firstName: 'John', lastName: 'Doe' };

            await act(async () => {
                await result.current.signUp(email, password, metadata);
            });

            expect(mockSignUp).toHaveBeenCalledWith({
                email,
                password,
                options: {
                    emailRedirectTo: 'http://localhost:3000/',
                    data: metadata,
                },
            });
        });

        it('should return error when signUp fails', async () => {
            const signUpError = { message: 'Sign up failed' };
            mockSignUp.mockResolvedValue({ error: signUpError });

            const { result } = renderHook(() => useAuth());

            let signUpResult;
            await act(async () => {
                signUpResult = await result.current.signUp('test@example.com', 'password123');
            });

            expect(signUpResult).toEqual({ error: signUpError });
        });

        it('should handle signUp without metadata', async () => {
            mockSignUp.mockResolvedValue({ error: null });

            const { result } = renderHook(() => useAuth());

            await act(async () => {
                await result.current.signUp('test@example.com', 'password123');
            });

            expect(mockSignUp).toHaveBeenCalledWith({
                email: 'test@example.com',
                password: 'password123',
                options: {
                    emailRedirectTo: 'http://localhost:3000/',
                    data: undefined,
                },
            });
        });
    });

    describe('signIn', () => {
        it('should call supabase signInWithPassword with correct parameters', async () => {
            mockSignInWithPassword.mockResolvedValue({ error: null });

            const { result } = renderHook(() => useAuth());

            const email = 'test@example.com';
            const password = 'password123';

            await act(async () => {
                await result.current.signIn(email, password);
            });

            expect(mockSignInWithPassword).toHaveBeenCalledWith({
                email,
                password,
            });
        });

        it('should return error when signIn fails', async () => {
            const signInError = { message: 'Invalid credentials' };
            mockSignInWithPassword.mockResolvedValue({ error: signInError });

            const { result } = renderHook(() => useAuth());

            let signInResult;
            await act(async () => {
                signInResult = await result.current.signIn('test@example.com', 'wrongpassword');
            });

            expect(signInResult).toEqual({ error: signInError });
        });
    });

    describe('signOut', () => {
        it('should call supabase signOut', async () => {
            mockSignOut.mockResolvedValue({ error: null });

            const { result } = renderHook(() => useAuth());

            await act(async () => {
                await result.current.signOut();
            });

            expect(mockSignOut).toHaveBeenCalled();
        });

        it('should return error when signOut fails', async () => {
            const signOutError = { message: 'Sign out failed' };
            mockSignOut.mockResolvedValue({ error: signOutError });

            const { result } = renderHook(() => useAuth());

            let signOutResult;
            await act(async () => {
                signOutResult = await result.current.signOut();
            });

            expect(signOutResult).toEqual({ error: signOutError });
        });
    });

    describe('isAuthenticated', () => {
        it('should be false when no user', () => {
            const { result } = renderHook(() => useAuth());

            expect(result.current.isAuthenticated).toBe(false);
        });

        it('should be true when user exists', async () => {
            const { result } = renderHook(() => useAuth());

            await act(async () => {
                mockAuthStateChangeCallback('SIGNED_IN', mockSession);
            });

            expect(result.current.isAuthenticated).toBe(true);
        });
    });
});
