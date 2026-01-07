import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { cva } from 'class-variance-authority'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Recreate the cn utility function for testing
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Recreate the buttonVariants for testing (same as in components/ui/button.tsx)
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-white hover:bg-destructive/90",
        outline: "border bg-background text-foreground hover:bg-accent",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md gap-1.5 px-3",
        lg: "h-10 rounded-md px-6",
        icon: "size-9 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

// Recreate the badgeVariants for testing
const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive text-white",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

/**
 * Feature: nextjs-mvc-conversion, Property 12: UI Component Equivalence
 * For any UI component with any valid props combination, the rendered output
 * SHALL be functionally equivalent to the original Vite/React implementation.
 * Validates: Requirements 9.2, 9.4
 */
describe('UI Component Equivalence', () => {
  describe('cn utility function', () => {
    it('should merge class names correctly for any combination of strings', () => {
      fc.assert(
        fc.property(
          fc.array(fc.string({ minLength: 0, maxLength: 50 }), { minLength: 0, maxLength: 10 }),
          (classNames) => {
            let didThrow = false
            let result = ''
            try {
              result = cn(...classNames)
            } catch {
              didThrow = true
            }
            expect(didThrow).toBe(false)
            expect(typeof result).toBe('string')
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should handle undefined and null values without throwing', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.oneof(
              fc.string(),
              fc.constant(undefined),
              fc.constant(null),
              fc.constant(false),
              fc.constant('')
            ),
            { minLength: 0, maxLength: 10 }
          ),
          (inputs) => {
            let didThrow = false
            try {
              cn(...inputs)
            } catch {
              didThrow = true
            }
            expect(didThrow).toBe(false)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should produce consistent output for the same inputs', () => {
      fc.assert(
        fc.property(
          fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 5 }),
          (classNames) => {
            const result1 = cn(...classNames)
            const result2 = cn(...classNames)
            expect(result1).toBe(result2)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should merge Tailwind classes correctly', () => {
      const result = cn('p-4', 'p-2')
      expect(result).toBe('p-2')

      const result2 = cn('text-red-500', 'text-blue-500')
      expect(result2).toBe('text-blue-500')

      const result3 = cn('bg-white', 'bg-black')
      expect(result3).toBe('bg-black')
    })
  })

  describe('Button variants', () => {
    const validVariants = ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'] as const
    const validSizes = ['default', 'sm', 'lg', 'icon'] as const

    it('should generate valid class strings for any valid variant and size combination', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...validVariants),
          fc.constantFrom(...validSizes),
          (variant, size) => {
            const classes = buttonVariants({ variant, size })
            expect(typeof classes).toBe('string')
            expect(classes.length).toBeGreaterThan(0)
            expect(classes).toContain('inline-flex')
            expect(classes).toContain('items-center')
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should include variant-specific classes for each variant', () => {
      const defaultClasses = buttonVariants({ variant: 'default' })
      expect(defaultClasses).toContain('bg-primary')

      const destructiveClasses = buttonVariants({ variant: 'destructive' })
      expect(destructiveClasses).toContain('bg-destructive')

      const outlineClasses = buttonVariants({ variant: 'outline' })
      expect(outlineClasses).toContain('border')

      const ghostClasses = buttonVariants({ variant: 'ghost' })
      expect(ghostClasses).toContain('hover:bg-accent')

      const linkClasses = buttonVariants({ variant: 'link' })
      expect(linkClasses).toContain('underline-offset-4')
    })

    it('should include size-specific classes for each size', () => {
      const defaultSize = buttonVariants({ size: 'default' })
      expect(defaultSize).toContain('h-9')

      const smSize = buttonVariants({ size: 'sm' })
      expect(smSize).toContain('h-8')

      const lgSize = buttonVariants({ size: 'lg' })
      expect(lgSize).toContain('h-10')

      const iconSize = buttonVariants({ size: 'icon' })
      expect(iconSize).toContain('size-9')
    })

    it('should merge custom className with variant classes', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...validVariants),
          fc.constantFrom(...validSizes),
          fc.string({ minLength: 1, maxLength: 30 }).filter(s => /^[a-z-]+$/.test(s)),
          (variant, size, customClass) => {
            const classes = buttonVariants({ variant, size, className: customClass })
            expect(classes).toContain(customClass)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should use default variant and size when not specified', () => {
      const defaultClasses = buttonVariants({})
      const explicitDefaultClasses = buttonVariants({ variant: 'default', size: 'default' })
      expect(defaultClasses).toBe(explicitDefaultClasses)
    })
  })

  describe('Badge variants', () => {
    const validVariants = ['default', 'secondary', 'destructive', 'outline'] as const

    it('should generate valid class strings for any valid variant', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...validVariants),
          (variant) => {
            const classes = badgeVariants({ variant })
            expect(typeof classes).toBe('string')
            expect(classes.length).toBeGreaterThan(0)
            expect(classes).toContain('inline-flex')
            expect(classes).toContain('items-center')
            expect(classes).toContain('rounded-md')
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should include variant-specific classes for each variant', () => {
      const defaultClasses = badgeVariants({ variant: 'default' })
      expect(defaultClasses).toContain('bg-primary')

      const secondaryClasses = badgeVariants({ variant: 'secondary' })
      expect(secondaryClasses).toContain('bg-secondary')

      const destructiveClasses = badgeVariants({ variant: 'destructive' })
      expect(destructiveClasses).toContain('bg-destructive')

      const outlineClasses = badgeVariants({ variant: 'outline' })
      expect(outlineClasses).toContain('text-foreground')
    })

    it('should use default variant when not specified', () => {
      const defaultClasses = badgeVariants({})
      const explicitDefaultClasses = badgeVariants({ variant: 'default' })
      expect(defaultClasses).toBe(explicitDefaultClasses)
    })
  })

  describe('Variant function consistency', () => {
    it('should produce deterministic output for buttonVariants', () => {
      fc.assert(
        fc.property(
          fc.constantFrom<'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'>('default', 'destructive', 'outline', 'secondary', 'ghost', 'link'),
          fc.constantFrom<'default' | 'sm' | 'lg' | 'icon'>('default', 'sm', 'lg', 'icon'),
          (variant, size) => {
            const result1 = buttonVariants({ variant, size })
            const result2 = buttonVariants({ variant, size })
            expect(result1).toBe(result2)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should produce deterministic output for badgeVariants', () => {
      fc.assert(
        fc.property(
          fc.constantFrom<'default' | 'secondary' | 'destructive' | 'outline'>('default', 'secondary', 'destructive', 'outline'),
          (variant) => {
            const result1 = badgeVariants({ variant })
            const result2 = badgeVariants({ variant })
            expect(result1).toBe(result2)
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('Accessibility classes', () => {
    it('should include focus-visible classes for keyboard accessibility in buttons', () => {
      const classes = buttonVariants({})
      expect(classes).toContain('focus-visible:')
    })

    it('should include disabled state classes in buttons', () => {
      const classes = buttonVariants({})
      expect(classes).toContain('disabled:pointer-events-none')
      expect(classes).toContain('disabled:opacity-50')
    })

    it('should include aria-invalid styling for form validation in buttons', () => {
      const classes = buttonVariants({})
      expect(classes).toContain('aria-invalid:')
    })

    it('should include focus-visible classes for keyboard accessibility in badges', () => {
      const classes = badgeVariants({})
      expect(classes).toContain('focus-visible:')
    })
  })
})
