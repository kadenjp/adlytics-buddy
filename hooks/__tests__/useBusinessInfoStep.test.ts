import { renderHook, act } from '@testing-library/react';
import { useBusinessInfoStep } from '../useBusinessInfoStep';

describe('useBusinessInfoStep', () => {
  const mockOnNext = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateAndNext', () => {
    it('should call onNext when business name is provided', () => {
      const businessInfo = {
        businessName: 'Test Business',
        industry: 'Technology',
      };

      const { result } = renderHook(() => 
        useBusinessInfoStep(businessInfo, mockOnNext)
      );

      act(() => {
        result.current.validateAndNext();
      });

      expect(mockOnNext).toHaveBeenCalledTimes(1);
    });

    it('should not call onNext when business name is empty', () => {
      const businessInfo = {
        businessName: '',
        industry: 'Technology',
      };

      const { result } = renderHook(() => 
        useBusinessInfoStep(businessInfo, mockOnNext)
      );

      act(() => {
        result.current.validateAndNext();
      });

      expect(mockOnNext).not.toHaveBeenCalled();
    });

    it('should not call onNext when business name is undefined', () => {
      const businessInfo = {
        businessName: undefined,
        industry: 'Technology',
      };

      const { result } = renderHook(() => 
        useBusinessInfoStep(businessInfo, mockOnNext)
      );

      act(() => {
        result.current.validateAndNext();
      });

      expect(mockOnNext).not.toHaveBeenCalled();
    });

    it('should not call onNext when business name is null', () => {
      const businessInfo = {
        businessName: null,
        industry: 'Technology',
      };

      const { result } = renderHook(() => 
        useBusinessInfoStep(businessInfo, mockOnNext)
      );

      act(() => {
        result.current.validateAndNext();
      });

      expect(mockOnNext).not.toHaveBeenCalled();
    });

    it('should work with whitespace-only business name', () => {
      const businessInfo = {
        businessName: '   ',
        industry: 'Technology',
      };

      const { result } = renderHook(() => 
        useBusinessInfoStep(businessInfo, mockOnNext)
      );

      act(() => {
        result.current.validateAndNext();
      });

      // The hook doesn't trim, so whitespace is considered valid
      expect(mockOnNext).toHaveBeenCalledTimes(1);
    });

    it('should handle business name with special characters', () => {
      const businessInfo = {
        businessName: 'Test & Company, LLC.',
        industry: 'Legal',
      };

      const { result } = renderHook(() => 
        useBusinessInfoStep(businessInfo, mockOnNext)
      );

      act(() => {
        result.current.validateAndNext();
      });

      expect(mockOnNext).toHaveBeenCalledTimes(1);
    });

    it('should not be affected by industry value', () => {
      const businessInfoWithoutIndustry = {
        businessName: 'Test Business',
        industry: '',
      };

      const { result } = renderHook(() => 
        useBusinessInfoStep(businessInfoWithoutIndustry, mockOnNext)
      );

      act(() => {
        result.current.validateAndNext();
      });

      expect(mockOnNext).toHaveBeenCalledTimes(1);
    });
  });

  describe('useCallback dependencies', () => {
    it('should memoize the validateAndNext function correctly', () => {
      const businessInfo = {
        businessName: 'Test Business',
        industry: 'Technology',
      };

      const { result, rerender } = renderHook(
        ({ info, onNext }) => useBusinessInfoStep(info, onNext),
        {
          initialProps: {
            info: businessInfo,
            onNext: mockOnNext,
          },
        }
      );

      const firstValidateAndNext = result.current.validateAndNext;

      // Rerender with same props
      rerender({
        info: businessInfo,
        onNext: mockOnNext,
      });

      const secondValidateAndNext = result.current.validateAndNext;

      // Should be the same function reference due to useCallback
      expect(firstValidateAndNext).toBe(secondValidateAndNext);
    });

    it('should create new function when businessInfo changes', () => {
      const initialBusinessInfo = {
        businessName: 'Test Business',
        industry: 'Technology',
      };

      const updatedBusinessInfo = {
        businessName: 'Updated Business',
        industry: 'Technology',
      };

      const { result, rerender } = renderHook(
        ({ info, onNext }) => useBusinessInfoStep(info, onNext),
        {
          initialProps: {
            info: initialBusinessInfo,
            onNext: mockOnNext,
          },
        }
      );

      const firstValidateAndNext = result.current.validateAndNext;

      // Rerender with updated businessInfo
      rerender({
        info: updatedBusinessInfo,
        onNext: mockOnNext,
      });

      const secondValidateAndNext = result.current.validateAndNext;

      // Should be different function reference when dependencies change
      expect(firstValidateAndNext).not.toBe(secondValidateAndNext);
    });

    it('should create new function when onNext changes', () => {
      const businessInfo = {
        businessName: 'Test Business',
        industry: 'Technology',
      };

      const newMockOnNext = jest.fn();

      const { result, rerender } = renderHook(
        ({ info, onNext }) => useBusinessInfoStep(info, onNext),
        {
          initialProps: {
            info: businessInfo,
            onNext: mockOnNext,
          },
        }
      );

      const firstValidateAndNext = result.current.validateAndNext;

      // Rerender with different onNext function
      rerender({
        info: businessInfo,
        onNext: newMockOnNext,
      });

      const secondValidateAndNext = result.current.validateAndNext;

      // Should be different function reference when dependencies change
      expect(firstValidateAndNext).not.toBe(secondValidateAndNext);

      // Test that new function works with new callback
      act(() => {
        secondValidateAndNext();
      });

      expect(newMockOnNext).toHaveBeenCalledTimes(1);
      expect(mockOnNext).not.toHaveBeenCalled();
    });
  });
});
