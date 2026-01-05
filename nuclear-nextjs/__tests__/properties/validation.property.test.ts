import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { validateShipment } from '../../controllers/shipment.controller'
import { validateLoginCredentials } from '../../controllers/auth.controller'
import { validatePermit, validateAlert } from '../../controllers/compliance.controller'

describe('Validation Error Handling', () => {
  /**
   * Feature: nextjs-mvc-conversion, Property 8: Validation Error Handling
   * *For any* invalid input data passed to a controller validation function, 
   * the controller SHALL return an error result with appropriate error information 
   * rather than throwing an exception.
   * **Validates: Requirements 5.6**
   */

  describe('Shipment Validation', () => {
    it('should return error result for null input', () => {
      const result = validateShipment(null)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.code).toBe('INVALID_SHIPMENT')
        expect(result.error.message).toBeDefined()
      }
    })

    it('should return error result for undefined input', () => {
      const result = validateShipment(undefined)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.code).toBe('INVALID_SHIPMENT')
      }
    })

    it('should return error result for any non-object input', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.string(),
            fc.integer(),
            fc.boolean(),
            fc.constant(null),
            fc.constant(undefined),
            fc.array(fc.anything())
          ),
          (invalidInput) => {
            const result = validateShipment(invalidInput)
            
            // Should return error result, not throw
            expect(result.success).toBe(false)
            if (!result.success) {
              expect(result.error).toBeDefined()
              expect(result.error.code).toBeDefined()
              expect(result.error.message).toBeDefined()
            }
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should return error result with field info for objects with missing required fields', () => {
      fc.assert(
        fc.property(
          fc.record({
            // Randomly include or exclude fields
            id: fc.option(fc.string(), { nil: undefined }),
            isotope: fc.option(fc.string(), { nil: undefined }),
            origin: fc.option(fc.string(), { nil: undefined }),
            destination: fc.option(fc.string(), { nil: undefined }),
            status: fc.option(fc.string(), { nil: undefined }),
            eta: fc.option(fc.string(), { nil: undefined }),
            statusColor: fc.option(fc.string(), { nil: undefined }),
          }).filter(obj => {
            // Ensure at least one required field is missing or invalid
            return !obj.id || !obj.isotope || !obj.origin || !obj.destination || 
                   !['In Transit', 'At Customs', 'Dispatched', 'Delivered', 'Pending'].includes(obj.status || '')
          }),
          (invalidShipment) => {
            const result = validateShipment(invalidShipment)
            
            // Should return error result with field information
            expect(result.success).toBe(false)
            if (!result.success) {
              expect(result.error.code).toBe('INVALID_SHIPMENT')
              expect(result.error.fields).toBeDefined()
              expect(Array.isArray(result.error.fields)).toBe(true)
            }
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should return error result for objects with invalid status values', () => {
      fc.assert(
        fc.property(
          fc.string().filter(s => !['In Transit', 'At Customs', 'Dispatched', 'Delivered', 'Pending'].includes(s)),
          (invalidStatus) => {
            const shipment = {
              id: 'test-id',
              isotope: 'Tc-99m',
              origin: 'Test Origin',
              destination: 'Test Destination',
              status: invalidStatus,
              eta: '2024-01-15',
              statusColor: 'bg-blue-100'
            }
            
            const result = validateShipment(shipment)
            
            expect(result.success).toBe(false)
            if (!result.success) {
              expect(result.error.fields).toContain('status')
            }
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('Login Credentials Validation', () => {
    it('should return error result for empty email', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('', '   ', '\t', '\n'),
          fc.string({ minLength: 1 }),
          (emptyEmail, password) => {
            const result = validateLoginCredentials({ email: emptyEmail, password })
            
            expect(result.success).toBe(false)
            if (!result.success) {
              expect(result.error.code).toBe('INVALID_CREDENTIALS')
              expect(result.error.fields).toContain('email')
            }
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should return error result for invalid email format', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => !s.includes('@') || s.startsWith('@') || s.endsWith('@')),
          fc.string({ minLength: 1 }),
          (invalidEmail, password) => {
            const result = validateLoginCredentials({ email: invalidEmail, password })
            
            expect(result.success).toBe(false)
            if (!result.success) {
              expect(result.error.code).toBe('INVALID_CREDENTIALS')
              expect(result.error.fields).toContain('email')
            }
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should return error result for empty password', () => {
      fc.assert(
        fc.property(
          fc.tuple(
            fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[a-zA-Z0-9]+$/.test(s)),
            fc.constantFrom('example.com', 'test.org')
          ).map(([local, domain]) => `${local}@${domain}`),
          fc.constantFrom('', '   ', '\t'),
          (validEmail, emptyPassword) => {
            const result = validateLoginCredentials({ email: validEmail, password: emptyPassword })
            
            expect(result.success).toBe(false)
            if (!result.success) {
              expect(result.error.code).toBe('INVALID_CREDENTIALS')
              expect(result.error.fields).toContain('password')
            }
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should return error result with multiple fields when both email and password are invalid', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('', 'invalid', '@bad.com'),
          fc.constantFrom('', '   '),
          (invalidEmail, invalidPassword) => {
            const result = validateLoginCredentials({ email: invalidEmail, password: invalidPassword })
            
            expect(result.success).toBe(false)
            if (!result.success) {
              expect(result.error.code).toBe('INVALID_CREDENTIALS')
              expect(result.error.fields).toBeDefined()
              // Should have at least one field error
              expect(result.error.fields!.length).toBeGreaterThan(0)
            }
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('Permit Validation', () => {
    it('should return error result for null or undefined input', () => {
      expect(validatePermit(null).success).toBe(false)
      expect(validatePermit(undefined).success).toBe(false)
    })

    it('should return error result for any non-object input', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.string(),
            fc.integer(),
            fc.boolean(),
            fc.constant(null),
            fc.constant(undefined)
          ),
          (invalidInput) => {
            const result = validatePermit(invalidInput)
            
            expect(result.success).toBe(false)
            if (!result.success) {
              expect(result.error.code).toBe('INVALID_PERMIT')
            }
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should return error result for objects with missing required fields', () => {
      fc.assert(
        fc.property(
          fc.record({
            id: fc.option(fc.string(), { nil: undefined }),
            name: fc.option(fc.string(), { nil: undefined }),
            expiryDate: fc.option(fc.date(), { nil: undefined }),
            status: fc.option(fc.constantFrom('valid', 'expiring', 'expired'), { nil: undefined }),
          }).filter(obj => !obj.id || !obj.name || !obj.status),
          (invalidPermit) => {
            const result = validatePermit(invalidPermit)
            
            expect(result.success).toBe(false)
            if (!result.success) {
              expect(result.error.code).toBe('INVALID_PERMIT')
              expect(result.error.fields).toBeDefined()
            }
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should return error result for invalid status values', () => {
      fc.assert(
        fc.property(
          fc.string().filter(s => !['valid', 'expiring', 'expired'].includes(s)),
          (invalidStatus) => {
            const permit = {
              id: 'test-id',
              name: 'Test Permit',
              expiryDate: new Date(),
              status: invalidStatus
            }
            
            const result = validatePermit(permit)
            
            expect(result.success).toBe(false)
            if (!result.success) {
              expect(result.error.fields).toContain('status')
            }
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('Alert Validation', () => {
    it('should return error result for null or undefined input', () => {
      expect(validateAlert(null).success).toBe(false)
      expect(validateAlert(undefined).success).toBe(false)
    })

    it('should return error result for any non-object input', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.string(),
            fc.integer(),
            fc.boolean(),
            fc.constant(null),
            fc.constant(undefined)
          ),
          (invalidInput) => {
            const result = validateAlert(invalidInput)
            
            expect(result.success).toBe(false)
            if (!result.success) {
              expect(result.error.code).toBe('INVALID_ALERT')
            }
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should return error result for invalid severity values', () => {
      fc.assert(
        fc.property(
          fc.string().filter(s => !['warning', 'info', 'error'].includes(s)),
          (invalidSeverity) => {
            const alert = {
              id: 'test-id',
              severity: invalidSeverity,
              title: 'Test Alert',
              description: 'Test description'
            }
            
            const result = validateAlert(alert)
            
            expect(result.success).toBe(false)
            if (!result.success) {
              expect(result.error.fields).toContain('severity')
            }
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('General Error Handling Properties', () => {
    it('should never throw exceptions for any input to validateShipment', () => {
      fc.assert(
        fc.property(
          fc.anything(),
          (anyInput) => {
            // Should not throw, should return Result type
            let didThrow = false
            try {
              const result = validateShipment(anyInput)
              // Result should always have success property
              expect(typeof result.success).toBe('boolean')
            } catch {
              didThrow = true
            }
            expect(didThrow).toBe(false)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should never throw exceptions for any input to validatePermit', () => {
      fc.assert(
        fc.property(
          fc.anything(),
          (anyInput) => {
            let didThrow = false
            try {
              const result = validatePermit(anyInput)
              expect(typeof result.success).toBe('boolean')
            } catch {
              didThrow = true
            }
            expect(didThrow).toBe(false)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should never throw exceptions for any input to validateAlert', () => {
      fc.assert(
        fc.property(
          fc.anything(),
          (anyInput) => {
            let didThrow = false
            try {
              const result = validateAlert(anyInput)
              expect(typeof result.success).toBe('boolean')
            } catch {
              didThrow = true
            }
            expect(didThrow).toBe(false)
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})
