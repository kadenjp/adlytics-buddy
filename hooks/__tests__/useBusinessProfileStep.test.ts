import { renderHook, act } from '@testing-library/react';
import { useBusinessProfileStep } from '../useBusinessProfileStep';

describe('useBusinessProfileStep', () => {
  let mockBusinessProfile;
  let mockSetBusinessProfile;

  beforeEach(() => {
    mockBusinessProfile = {
      address: '',
      targetRadius: 25,
      businessGoals: [],
      targetAge: [25, 55] as [number, number],
      targetAudience: [],
    };
    
    mockSetBusinessProfile = jest.fn();
  });

  describe('toggleBusinessGoal', () => {
    it('should add a goal when it is not in the list', () => {
      const { result } = renderHook(() => 
        useBusinessProfileStep(mockSetBusinessProfile)
      );

      act(() => {
        result.current.toggleBusinessGoal('Growth');
      });

      expect(mockSetBusinessProfile).toHaveBeenCalledTimes(1);
      expect(mockSetBusinessProfile).toHaveBeenCalledWith(expect.any(Function));

      // Test the updater function
      const updaterFunction = mockSetBusinessProfile.mock.calls[0][0];
      const newState = updaterFunction(mockBusinessProfile);

      expect(newState.businessGoals).toEqual(['Growth']);
      expect(newState.address).toBe('');
      expect(newState.targetRadius).toBe(25);
      expect(newState.targetAge).toEqual([25, 55]);
      expect(newState.targetAudience).toEqual([]);
    });

    it('should remove a goal when it is already in the list', () => {
      const currentProfile = {
        ...mockBusinessProfile,
        businessGoals: ['Growth', 'Expansion', 'Marketing'],
      };
      
      const { result } = renderHook(() => 
        useBusinessProfileStep(mockSetBusinessProfile)
      );

      act(() => {
        result.current.toggleBusinessGoal('Expansion');
      });

      const updaterFunction = mockSetBusinessProfile.mock.calls[0][0];
      const newState = updaterFunction(currentProfile);

      expect(newState.businessGoals).toEqual(['Growth', 'Marketing']);
    });

    it('should handle adding multiple goals sequentially', () => {
      const { result } = renderHook(() => 
        useBusinessProfileStep(mockSetBusinessProfile)
      );

      act(() => {
        result.current.toggleBusinessGoal('Growth');
      });

      // Simulate state update
      let updaterFunction = mockSetBusinessProfile.mock.calls[0][0];
      let currentState = updaterFunction(mockBusinessProfile);

      act(() => {
        result.current.toggleBusinessGoal('Marketing');
      });

      updaterFunction = mockSetBusinessProfile.mock.calls[1][0];
      const newState = updaterFunction(currentState);

      expect(newState.businessGoals).toEqual(['Growth', 'Marketing']);
    });

    it('should handle empty goal string', () => {
      const { result } = renderHook(() => 
        useBusinessProfileStep(mockSetBusinessProfile)
      );

      act(() => {
        result.current.toggleBusinessGoal('');
      });

      const updaterFunction = mockSetBusinessProfile.mock.calls[0][0];
      const newState = updaterFunction(mockBusinessProfile);

      expect(newState.businessGoals).toEqual(['']);
    });

    it('should handle removing a goal when it exists', () => {
      const currentProfile = {
        ...mockBusinessProfile,
        businessGoals: ['Growth'],
      };
      
      const { result } = renderHook(() => 
        useBusinessProfileStep(mockSetBusinessProfile)
      );

      act(() => {
        result.current.toggleBusinessGoal('Growth');
      });

      const updaterFunction = mockSetBusinessProfile.mock.calls[0][0];
      const newState = updaterFunction(currentProfile);

      expect(newState.businessGoals).toEqual([]);
    });

    it('should preserve other properties when toggling goals', () => {
      const currentProfile = {
        address: '123 Main St',
        targetRadius: 50,
        businessGoals: ['Growth'],
        targetAge: [20, 60] as [number, number],
        targetAudience: ['Adults', 'Seniors'],
      };

      const { result } = renderHook(() => 
        useBusinessProfileStep(mockSetBusinessProfile)
      );

      act(() => {
        result.current.toggleBusinessGoal('Marketing');
      });

      const updaterFunction = mockSetBusinessProfile.mock.calls[0][0];
      const newState = updaterFunction(currentProfile);

      expect(newState.businessGoals).toEqual(['Growth', 'Marketing']);
      expect(newState.address).toBe('123 Main St');
      expect(newState.targetRadius).toBe(50);
      expect(newState.targetAge).toEqual([20, 60]);
      expect(newState.targetAudience).toEqual(['Adults', 'Seniors']);
    });
  });

  describe('toggleTargetAudience', () => {
    it('should add an audience when it is not in the list', () => {
      const { result } = renderHook(() => 
        useBusinessProfileStep(mockSetBusinessProfile)
      );

      act(() => {
        result.current.toggleTargetAudience('Young Adults');
      });

      expect(mockSetBusinessProfile).toHaveBeenCalledTimes(1);
      expect(mockSetBusinessProfile).toHaveBeenCalledWith(expect.any(Function));

      const updaterFunction = mockSetBusinessProfile.mock.calls[0][0];
      const newState = updaterFunction(mockBusinessProfile);

      expect(newState.targetAudience).toEqual(['Young Adults']);
      expect(newState.address).toBe('');
      expect(newState.targetRadius).toBe(25);
      expect(newState.targetAge).toEqual([25, 55]);
      expect(newState.businessGoals).toEqual([]);
    });

    it('should remove an audience when it is already in the list', () => {
      const currentProfile = {
        ...mockBusinessProfile,
        targetAudience: ['Young Adults', 'Professionals', 'Seniors'],
      };
      
      const { result } = renderHook(() => 
        useBusinessProfileStep(mockSetBusinessProfile)
      );

      act(() => {
        result.current.toggleTargetAudience('Professionals');
      });

      const updaterFunction = mockSetBusinessProfile.mock.calls[0][0];
      const newState = updaterFunction(currentProfile);

      expect(newState.targetAudience).toEqual(['Young Adults', 'Seniors']);
    });

    it('should handle adding multiple audiences sequentially', () => {
      const { result } = renderHook(() => 
        useBusinessProfileStep(mockSetBusinessProfile)
      );

      act(() => {
        result.current.toggleTargetAudience('Young Adults');
      });

      let updaterFunction = mockSetBusinessProfile.mock.calls[0][0];
      let currentState = updaterFunction(mockBusinessProfile);

      act(() => {
        result.current.toggleTargetAudience('Professionals');
      });

      updaterFunction = mockSetBusinessProfile.mock.calls[1][0];
      const newState = updaterFunction(currentState);

      expect(newState.targetAudience).toEqual(['Young Adults', 'Professionals']);
    });

    it('should handle empty audience string', () => {
      const { result } = renderHook(() => 
        useBusinessProfileStep(mockSetBusinessProfile)
      );

      act(() => {
        result.current.toggleTargetAudience('');
      });

      const updaterFunction = mockSetBusinessProfile.mock.calls[0][0];
      const newState = updaterFunction(mockBusinessProfile);

      expect(newState.targetAudience).toEqual(['']);
    });

    it('should handle removing an audience when it exists', () => {
      const currentProfile = {
        ...mockBusinessProfile,
        targetAudience: ['Young Adults'],
      };
      
      const { result } = renderHook(() => 
        useBusinessProfileStep(mockSetBusinessProfile)
      );

      act(() => {
        result.current.toggleTargetAudience('Young Adults');
      });

      const updaterFunction = mockSetBusinessProfile.mock.calls[0][0];
      const newState = updaterFunction(currentProfile);

      expect(newState.targetAudience).toEqual([]);
    });

    it('should preserve other properties when toggling audiences', () => {
      const currentProfile = {
        address: '456 Oak St',
        targetRadius: 30,
        businessGoals: ['Growth', 'Marketing'],
        targetAge: [18, 65] as [number, number],
        targetAudience: ['Young Adults'],
      };

      const { result } = renderHook(() => 
        useBusinessProfileStep(mockSetBusinessProfile)
      );

      act(() => {
        result.current.toggleTargetAudience('Professionals');
      });

      const updaterFunction = mockSetBusinessProfile.mock.calls[0][0];
      const newState = updaterFunction(currentProfile);

      expect(newState.targetAudience).toEqual(['Young Adults', 'Professionals']);
      expect(newState.address).toBe('456 Oak St');
      expect(newState.targetRadius).toBe(30);
      expect(newState.targetAge).toEqual([18, 65]);
      expect(newState.businessGoals).toEqual(['Growth', 'Marketing']);
    });
  });

  describe('useCallback dependencies', () => {
    it('should memoize toggleBusinessGoal correctly', () => {
      const { result, rerender } = renderHook(
        ({ setter }) => useBusinessProfileStep(setter),
        {
          initialProps: { setter: mockSetBusinessProfile },
        }
      );

      const firstToggleBusinessGoal = result.current.toggleBusinessGoal;

      // Rerender with same setter
      rerender({ setter: mockSetBusinessProfile });

      const secondToggleBusinessGoal = result.current.toggleBusinessGoal;

      expect(firstToggleBusinessGoal).toBe(secondToggleBusinessGoal);
    });

    it('should memoize toggleTargetAudience correctly', () => {
      const { result, rerender } = renderHook(
        ({ setter }) => useBusinessProfileStep(setter),
        {
          initialProps: { setter: mockSetBusinessProfile },
        }
      );

      const firstToggleTargetAudience = result.current.toggleTargetAudience;

      // Rerender with same setter
      rerender({ setter: mockSetBusinessProfile });

      const secondToggleTargetAudience = result.current.toggleTargetAudience;

      expect(firstToggleTargetAudience).toBe(secondToggleTargetAudience);
    });

    it('should create new functions when setter changes', () => {
      const newMockSetBusinessProfile = jest.fn();

      const { result, rerender } = renderHook(
        ({ setter }) => useBusinessProfileStep(setter),
        {
          initialProps: { setter: mockSetBusinessProfile },
        }
      );

      const firstToggleBusinessGoal = result.current.toggleBusinessGoal;
      const firstToggleTargetAudience = result.current.toggleTargetAudience;

      // Rerender with different setter
      rerender({ setter: newMockSetBusinessProfile });

      const secondToggleBusinessGoal = result.current.toggleBusinessGoal;
      const secondToggleTargetAudience = result.current.toggleTargetAudience;

      expect(firstToggleBusinessGoal).not.toBe(secondToggleBusinessGoal);
      expect(firstToggleTargetAudience).not.toBe(secondToggleTargetAudience);

      // Test that new functions work with new setter
      act(() => {
        secondToggleBusinessGoal('Test Goal');
      });

      expect(newMockSetBusinessProfile).toHaveBeenCalledTimes(1);
      expect(mockSetBusinessProfile).not.toHaveBeenCalled();
    });
  });

  describe('integration', () => {
    it('should handle toggling both goals and audiences', () => {
      const { result } = renderHook(() => 
        useBusinessProfileStep(mockSetBusinessProfile)
      );

      // Add a goal
      act(() => {
        result.current.toggleBusinessGoal('Growth');
      });

      let updaterFunction = mockSetBusinessProfile.mock.calls[0][0];
      let currentState = updaterFunction(mockBusinessProfile);

      // Add an audience
      act(() => {
        result.current.toggleTargetAudience('Young Adults');
      });

      updaterFunction = mockSetBusinessProfile.mock.calls[1][0];
      const newState = updaterFunction(currentState);

      expect(newState.businessGoals).toEqual(['Growth']);
      expect(newState.targetAudience).toEqual(['Young Adults']);
    });
  });
});
