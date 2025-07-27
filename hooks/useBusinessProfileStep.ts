import { useCallback } from 'react';

export function useBusinessProfileStep(setBusinessProfile) {
    // Toggle business goal
    const toggleBusinessGoal = useCallback((goal) => {
        setBusinessProfile(prev => ({
            ...prev,
            businessGoals: prev.businessGoals.includes(goal)
                ? prev.businessGoals.filter(g => g !== goal)
                : [...prev.businessGoals, goal]
        }));
    }, [setBusinessProfile]);

    // Toggle target audience
    const toggleTargetAudience = useCallback((audience) => {
        setBusinessProfile(prev => ({
            ...prev,
            targetAudience: prev.targetAudience.includes(audience)
                ? prev.targetAudience.filter(a => a !== audience)
                : [...prev.targetAudience, audience]
        }));
    }, [setBusinessProfile]);

    return {
        toggleBusinessGoal,
        toggleTargetAudience,
    };
}
