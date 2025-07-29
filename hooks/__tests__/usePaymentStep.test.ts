import { renderHook, act } from '@testing-library/react';
import { usePaymentStep } from '../usePaymentStep';

describe('usePaymentStep', () => {
  let mockPaymentInfo;
  let mockSetPaymentInfo;

  beforeEach(() => {
    mockPaymentInfo = {
      termsAccepted: false,
      paymentMethod: null,
      planId: '',
    };

    mockSetPaymentInfo = jest.fn();
  });

  describe('handleTermsChecked', () => {
    it('should set termsAccepted to true when checked is true', () => {
      const { result } = renderHook(() =>
        usePaymentStep(mockSetPaymentInfo)
      );

      act(() => {
        result.current.handleTermsChecked(true);
      });

      expect(mockSetPaymentInfo).toHaveBeenCalledTimes(1);
      expect(mockSetPaymentInfo).toHaveBeenCalledWith(expect.any(Function));

      // Test the updater function
      const updaterFunction = mockSetPaymentInfo.mock.calls[0][0];
      const newState = updaterFunction(mockPaymentInfo);

      expect(newState.termsAccepted).toBe(true);
      expect(newState.paymentMethod).toBe(null);
      expect(newState.planId).toBe('');
    });

    it('should set termsAccepted to false when checked is false', () => {
      const currentPaymentInfo = {
        ...mockPaymentInfo,
        termsAccepted: true,
      };

      const { result } = renderHook(() =>
        usePaymentStep(mockSetPaymentInfo)
      );

      act(() => {
        result.current.handleTermsChecked(false);
      });

      const updaterFunction = mockSetPaymentInfo.mock.calls[0][0];
      const newState = updaterFunction(currentPaymentInfo);

      expect(newState.termsAccepted).toBe(false);
    });

    it('should set termsAccepted to false when checked is falsy', () => {
      const { result } = renderHook(() =>
        usePaymentStep(mockSetPaymentInfo)
      );

      act(() => {
        result.current.handleTermsChecked(null);
      });

      const updaterFunction = mockSetPaymentInfo.mock.calls[0][0];
      const newState = updaterFunction(mockPaymentInfo);

      expect(newState.termsAccepted).toBe(false);
    });

    it('should set termsAccepted to true when checked is truthy', () => {
      const { result } = renderHook(() =>
        usePaymentStep(mockSetPaymentInfo)
      );

      act(() => {
        result.current.handleTermsChecked('checked');
      });

      const updaterFunction = mockSetPaymentInfo.mock.calls[0][0];
      const newState = updaterFunction(mockPaymentInfo);

      expect(newState.termsAccepted).toBe(true);
    });

    it('should preserve other properties when updating terms', () => {
      const currentPaymentInfo = {
        termsAccepted: false,
        paymentMethod: 'card',
        planId: 'pro-monthly',
        customerId: 'cus_123',
        subscriptionId: 'sub_456',
      };

      const { result } = renderHook(() =>
        usePaymentStep(mockSetPaymentInfo)
      );

      act(() => {
        result.current.handleTermsChecked(true);
      });

      const updaterFunction = mockSetPaymentInfo.mock.calls[0][0];
      const newState = updaterFunction(currentPaymentInfo);

      expect(newState.termsAccepted).toBe(true);
      expect(newState.paymentMethod).toBe('card');
      expect(newState.planId).toBe('pro-monthly');
      expect(newState.customerId).toBe('cus_123');
      expect(newState.subscriptionId).toBe('sub_456');
    });

    it('should handle multiple toggle operations', () => {
      const { result } = renderHook(() =>
        usePaymentStep(mockSetPaymentInfo)
      );

      // Check terms
      act(() => {
        result.current.handleTermsChecked(true);
      });

      let updaterFunction = mockSetPaymentInfo.mock.calls[0][0];
      const currentState = updaterFunction(mockPaymentInfo);

      // Uncheck terms
      act(() => {
        result.current.handleTermsChecked(false);
      });

      updaterFunction = mockSetPaymentInfo.mock.calls[1][0];
      const newState = updaterFunction(currentState);

      expect(newState.termsAccepted).toBe(false);
      expect(mockSetPaymentInfo).toHaveBeenCalledTimes(2);
    });

    it('should handle undefined checked value', () => {
      const { result } = renderHook(() =>
        usePaymentStep(mockSetPaymentInfo)
      );

      act(() => {
        result.current.handleTermsChecked(undefined);
      });

      const updaterFunction = mockSetPaymentInfo.mock.calls[0][0];
      const newState = updaterFunction(mockPaymentInfo);

      expect(newState.termsAccepted).toBe(false);
    });

    it('should handle zero as checked value', () => {
      const { result } = renderHook(() =>
        usePaymentStep(mockSetPaymentInfo)
      );

      act(() => {
        result.current.handleTermsChecked(0);
      });

      const updaterFunction = mockSetPaymentInfo.mock.calls[0][0];
      const newState = updaterFunction(mockPaymentInfo);

      expect(newState.termsAccepted).toBe(false);
    });

    it('should handle non-zero number as checked value', () => {
      const { result } = renderHook(() =>
        usePaymentStep(mockSetPaymentInfo)
      );

      act(() => {
        result.current.handleTermsChecked(1);
      });

      const updaterFunction = mockSetPaymentInfo.mock.calls[0][0];
      const newState = updaterFunction(mockPaymentInfo);

      expect(newState.termsAccepted).toBe(true);
    });

    it('should handle empty string as checked value', () => {
      const { result } = renderHook(() =>
        usePaymentStep(mockSetPaymentInfo)
      );

      act(() => {
        result.current.handleTermsChecked('');
      });

      const updaterFunction = mockSetPaymentInfo.mock.calls[0][0];
      const newState = updaterFunction(mockPaymentInfo);

      expect(newState.termsAccepted).toBe(false);
    });
  });

  describe('useCallback dependencies', () => {
    it('should memoize handleTermsChecked correctly', () => {
      const { result, rerender } = renderHook(
        ({ setter }) => usePaymentStep(setter),
        {
          initialProps: { setter: mockSetPaymentInfo },
        }
      );

      const firstHandleTermsChecked = result.current.handleTermsChecked;

      // Rerender with same setter
      rerender({ setter: mockSetPaymentInfo });

      const secondHandleTermsChecked = result.current.handleTermsChecked;

      expect(firstHandleTermsChecked).toBe(secondHandleTermsChecked);
    });

    it('should create new function when setter changes', () => {
      const newMockSetPaymentInfo = jest.fn();

      const { result, rerender } = renderHook(
        ({ setter }) => usePaymentStep(setter),
        {
          initialProps: { setter: mockSetPaymentInfo },
        }
      );

      const firstHandleTermsChecked = result.current.handleTermsChecked;

      // Rerender with different setter
      rerender({ setter: newMockSetPaymentInfo });

      const secondHandleTermsChecked = result.current.handleTermsChecked;

      expect(firstHandleTermsChecked).not.toBe(secondHandleTermsChecked);

      // Test that new function works with new setter
      act(() => {
        secondHandleTermsChecked(true);
      });

      expect(newMockSetPaymentInfo).toHaveBeenCalledTimes(1);
      expect(mockSetPaymentInfo).not.toHaveBeenCalled();
    });
  });

  describe('return value', () => {
    it('should return an object with handleTermsChecked function', () => {
      const { result } = renderHook(() =>
        usePaymentStep(mockSetPaymentInfo)
      );

      expect(result.current).toEqual({
        handleTermsChecked: expect.any(Function),
      });
    });

    it('should return the same object shape on re-renders', () => {
      const { result, rerender } = renderHook(() =>
        usePaymentStep(mockSetPaymentInfo)
      );

      const firstResult = result.current;

      rerender();

      const secondResult = result.current;

      expect(Object.keys(firstResult)).toEqual(Object.keys(secondResult));
      expect(firstResult.handleTermsChecked).toBe(secondResult.handleTermsChecked);
    });
  });

  describe('edge cases', () => {
    it('should throw error when setter is undefined', () => {
      const { result } = renderHook(() =>
        usePaymentStep(undefined)
      );

      // Should throw an error when trying to call the function
      expect(() => {
        result.current.handleTermsChecked(true);
      }).toThrow('setPaymentInfo is not a function');
    });

    it('should throw error when setter is null', () => {
      const { result } = renderHook(() =>
        usePaymentStep(null)
      );

      // Should throw an error when trying to call the function
      expect(() => {
        result.current.handleTermsChecked(true);
      }).toThrow('setPaymentInfo is not a function');
    });

    it('should throw error when setter is not a function', () => {
      const { result } = renderHook(() =>
        usePaymentStep('not-a-function' as any)
      );

      // Should not throw an error during render, but should throw when called
      expect(result.current.handleTermsChecked).toBeDefined();

      expect(() => {
        result.current.handleTermsChecked(true);
      }).toThrow('setPaymentInfo is not a function');
    });
  });
});
