import { renderHook, act } from '@testing-library/react';
import { useToast, toast, reducer } from '../use-toast';

// Mock setTimeout and clearTimeout
jest.useFakeTimers();

describe('useToast', () => {
    beforeEach(() => {
        jest.clearAllTimers();
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.runAllTimers();
    });

    describe('useToast hook', () => {
        it('should initialize with empty toasts array', () => {
            const { result } = renderHook(() => useToast());

            expect(result.current.toasts).toEqual([]);
        });

        it('should add a toast when toast() is called', () => {
            const { result } = renderHook(() => useToast());

            act(() => {
                result.current.toast({
                    title: 'Test Toast',
                    description: 'This is a test toast'
                });
            });

            expect(result.current.toasts).toHaveLength(1);
            expect(result.current.toasts[0].title).toBe('Test Toast');
            expect(result.current.toasts[0].description).toBe('This is a test toast');
            expect(result.current.toasts[0].open).toBe(true);
        });

        it('should limit toasts to TOAST_LIMIT (1)', () => {
            const { result } = renderHook(() => useToast());

            act(() => {
                result.current.toast({ title: 'First Toast' });
                result.current.toast({ title: 'Second Toast' });
                result.current.toast({ title: 'Third Toast' });
            });

            expect(result.current.toasts).toHaveLength(1);
            expect(result.current.toasts[0].title).toBe('Third Toast');
        });

        it('should dismiss a specific toast', () => {
            const { result } = renderHook(() => useToast());
            let toastId: string;

            act(() => {
                const toastResult = result.current.toast({ title: 'Test Toast' });
                toastId = toastResult.id;
            });

            expect(result.current.toasts[0].open).toBe(true);

            act(() => {
                result.current.dismiss(toastId);
            });

            expect(result.current.toasts[0].open).toBe(false);
        });

        it('should dismiss all toasts when no id is provided', () => {
            const { result } = renderHook(() => useToast());

            act(() => {
                result.current.toast({ title: 'First Toast' });
            });

            // Add another toast by replacing the first one (due to limit)
            act(() => {
                result.current.toast({ title: 'Second Toast' });
            });

            expect(result.current.toasts[0].open).toBe(true);

            act(() => {
                result.current.dismiss();
            });

            expect(result.current.toasts[0].open).toBe(false);
        });

        it('should remove toast after TOAST_REMOVE_DELAY when dismissed', () => {
            const { result } = renderHook(() => useToast());
            let toastId: string;

            act(() => {
                const toastResult = result.current.toast({ title: 'Test Toast' });
                toastId = toastResult.id;
            });

            expect(result.current.toasts).toHaveLength(1);

            act(() => {
                result.current.dismiss(toastId);
            });

            expect(result.current.toasts[0].open).toBe(false);

            // Fast-forward time to trigger removal
            act(() => {
                jest.runAllTimers();
            });

            expect(result.current.toasts).toHaveLength(0);
        });
    });

    describe('toast function', () => {
        it('should return toast object with id, dismiss, and update methods', () => {
            const toastResult = toast({ title: 'Test Toast' });

            expect(toastResult).toHaveProperty('id');
            expect(toastResult).toHaveProperty('dismiss');
            expect(toastResult).toHaveProperty('update');
            expect(typeof toastResult.id).toBe('string');
            expect(typeof toastResult.dismiss).toBe('function');
            expect(typeof toastResult.update).toBe('function');
        });

        it('should generate unique ids for different toasts', () => {
            const toast1 = toast({ title: 'Toast 1' });
            const toast2 = toast({ title: 'Toast 2' });

            expect(toast1.id).not.toBe(toast2.id);
        });

        it('should update toast when update method is called', () => {
            const { result } = renderHook(() => useToast());
            let toastResult: any;

            act(() => {
                toastResult = toast({ title: 'Original Title' });
            });

            act(() => {
                toastResult.update({ title: 'Updated Title', description: 'New description' });
            });

            expect(result.current.toasts[0].title).toBe('Updated Title');
            expect(result.current.toasts[0].description).toBe('New description');
        });

        it('should dismiss toast when dismiss method is called', () => {
            const { result } = renderHook(() => useToast());
            let toastResult: any;

            act(() => {
                toastResult = toast({ title: 'Test Toast' });
            });

            expect(result.current.toasts[0].open).toBe(true);

            act(() => {
                toastResult.dismiss();
            });

            expect(result.current.toasts[0].open).toBe(false);
        });
    });

    describe('reducer', () => {
        it('should add toast to state', () => {
            const initialState = { toasts: [] };
            const action = {
                type: 'ADD_TOAST' as const,
                toast: {
                    id: '1',
                    title: 'Test Toast',
                    open: true
                }
            };

            const newState = reducer(initialState, action);

            expect(newState.toasts).toHaveLength(1);
            expect(newState.toasts[0].title).toBe('Test Toast');
        });

        it('should update existing toast', () => {
            const initialState = {
                toasts: [{
                    id: '1',
                    title: 'Original Title',
                    open: true
                }]
            };
            const action = {
                type: 'UPDATE_TOAST' as const,
                toast: {
                    id: '1',
                    title: 'Updated Title'
                }
            };

            const newState = reducer(initialState, action);

            expect(newState.toasts[0].title).toBe('Updated Title');
            expect(newState.toasts[0].open).toBe(true);
        });

        it('should dismiss specific toast', () => {
            const initialState = {
                toasts: [{
                    id: '1',
                    title: 'Test Toast',
                    open: true
                }]
            };
            const action = {
                type: 'DISMISS_TOAST' as const,
                toastId: '1'
            };

            const newState = reducer(initialState, action);

            expect(newState.toasts[0].open).toBe(false);
        });

        it('should dismiss all toasts when no toastId provided', () => {
            const initialState = {
                toasts: [{
                    id: '1',
                    title: 'Test Toast 1',
                    open: true
                }]
            };
            const action = {
                type: 'DISMISS_TOAST' as const
            };

            const newState = reducer(initialState, action);

            expect(newState.toasts[0].open).toBe(false);
        });

        it('should remove specific toast', () => {
            const initialState = {
                toasts: [
                    { id: '1', title: 'Toast 1', open: true },
                    { id: '2', title: 'Toast 2', open: true }
                ]
            };
            const action = {
                type: 'REMOVE_TOAST' as const,
                toastId: '1'
            };

            const newState = reducer(initialState, action);

            expect(newState.toasts).toHaveLength(1);
            expect(newState.toasts[0].id).toBe('2');
        });

        it('should remove all toasts when no toastId provided', () => {
            const initialState = {
                toasts: [
                    { id: '1', title: 'Toast 1', open: true },
                    { id: '2', title: 'Toast 2', open: true }
                ]
            };
            const action = {
                type: 'REMOVE_TOAST' as const
            };

            const newState = reducer(initialState, action);

            expect(newState.toasts).toHaveLength(0);
        });
    });
});
