import { useCallback } from 'react';

export function useBusinessInfoStep(businessInfo, onNext) {
    // Validation logic
    const validateAndNext = useCallback(() => {
        if (!businessInfo.businessName) {
            return;
        }
        onNext();
    }, [businessInfo, onNext]);

    return {
        validateAndNext,
    };
}
