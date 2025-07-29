import { cn } from '../utils';

describe('utils', () => {
    describe('cn function', () => {
        it('should merge class names correctly', () => {
            const result = cn('bg-red-500', 'text-white');
            expect(result).toContain('bg-red-500');
            expect(result).toContain('text-white');
        });

        it('should handle conditional classes', () => {
            const isActive = true;
            const result = cn('base-class', isActive && 'active-class');
            expect(result).toContain('base-class');
            expect(result).toContain('active-class');
        });

        it('should handle false conditional classes', () => {
            const isActive = false;
            const result = cn('base-class', isActive && 'active-class');
            expect(result).toContain('base-class');
            expect(result).not.toContain('active-class');
        });

        it('should merge conflicting Tailwind classes correctly', () => {
            const result = cn('p-4', 'p-8');
            // twMerge should prioritize the last class
            expect(result).toContain('p-8');
            expect(result).not.toContain('p-4');
        });

        it('should handle empty inputs', () => {
            const result = cn();
            expect(result).toBe('');
        });

        it('should handle null and undefined inputs', () => {
            const result = cn('base-class', null, undefined, 'other-class');
            expect(result).toContain('base-class');
            expect(result).toContain('other-class');
        });

        it('should handle arrays of classes', () => {
            const result = cn(['class1', 'class2'], 'class3');
            expect(result).toContain('class1');
            expect(result).toContain('class2');
            expect(result).toContain('class3');
        });
    });
});
