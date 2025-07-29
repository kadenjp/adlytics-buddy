import { renderHook, act } from '@testing-library/react';
import { useIsMobile } from '../use-mobile';

// Mock window.matchMedia
const mockMatchMedia = jest.fn();

describe('useIsMobile', () => {
    beforeAll(() => {
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: mockMatchMedia,
        });
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return false initially', () => {
        const mockMediaQueryList = {
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
        };

        mockMatchMedia.mockReturnValue(mockMediaQueryList);

        // Mock window.innerWidth to be greater than mobile breakpoint
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 1024,
        });

        const { result } = renderHook(() => useIsMobile());

        expect(result.current).toBe(false);
    });

    it('should return true when window width is less than mobile breakpoint', () => {
        const mockMediaQueryList = {
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
        };

        mockMatchMedia.mockReturnValue(mockMediaQueryList);

        // Mock window.innerWidth to be less than mobile breakpoint (768px)
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 600,
        });

        const { result } = renderHook(() => useIsMobile());

        expect(result.current).toBe(true);
    });

    it('should update when media query changes', () => {
        let changeHandler: () => void;
        const mockMediaQueryList = {
            addEventListener: jest.fn((event, handler) => {
                if (event === 'change') {
                    changeHandler = handler;
                }
            }),
            removeEventListener: jest.fn(),
        };

        mockMatchMedia.mockReturnValue(mockMediaQueryList);

        // Start with desktop width
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 1024,
        });

        const { result } = renderHook(() => useIsMobile());

        expect(result.current).toBe(false);

        // Simulate changing to mobile width
        act(() => {
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 600,
            });
            changeHandler();
        });

        expect(result.current).toBe(true);
    });

    it('should set up media query listener correctly', () => {
        const mockMediaQueryList = {
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
        };

        mockMatchMedia.mockReturnValue(mockMediaQueryList);

        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 1024,
        });

        renderHook(() => useIsMobile());

        expect(mockMatchMedia).toHaveBeenCalledWith('(max-width: 767px)');
        expect(mockMediaQueryList.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });

    it('should clean up media query listener on unmount', () => {
        const mockMediaQueryList = {
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
        };

        mockMatchMedia.mockReturnValue(mockMediaQueryList);

        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 1024,
        });

        const { unmount } = renderHook(() => useIsMobile());

        unmount();

        expect(mockMediaQueryList.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });

    it('should handle edge case at exact breakpoint', () => {
        const mockMediaQueryList = {
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
        };

        mockMatchMedia.mockReturnValue(mockMediaQueryList);

        // Test at exactly 768px (should not be mobile)
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 768,
        });

        const { result } = renderHook(() => useIsMobile());

        expect(result.current).toBe(false);
    });

    it('should handle edge case at 767px (should be mobile)', () => {
        const mockMediaQueryList = {
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
        };

        mockMatchMedia.mockReturnValue(mockMediaQueryList);

        // Test at 767px (should be mobile)
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 767,
        });

        const { result } = renderHook(() => useIsMobile());

        expect(result.current).toBe(true);
    });
});
