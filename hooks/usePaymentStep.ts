import { useCallback } from 'react';

export function usePaymentStep(setPaymentInfo) {
    // Terms acceptance handler
    const handleTermsChecked = useCallback((checked) => {
        setPaymentInfo(prev => ({ ...prev, termsAccepted: !!checked }));
    }, [setPaymentInfo]);

    return {
        handleTermsChecked,
    };
}
