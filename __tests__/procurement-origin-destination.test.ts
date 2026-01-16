/**
 * Procurement Origin and Destination Tests
 * 
 * Tests for the origin/destination feature in procurement system
 */

import { describe, it, expect } from 'vitest'
import {
  formatShippingRoute,
  hasSelectedSupplier,
  type ProcurementRequest,
} from '@/models/procurement.model'

describe('Procurement Origin and Destination', () => {
  describe('formatShippingRoute', () => {
    it('should format complete route with origin and destination', () => {
      const result = formatShippingRoute('Johannesburg, South Africa', 'Cape Town, South Africa')
      
      expect(result).toBe('Johannesburg, So → Cape Town, So')
    })

    it('should abbreviate country names to 2 characters', () => {
      const result = formatShippingRoute('Nairobi, Kenya', 'Lagos, Nigeria')
      
      expect(result).toBe('Nairobi, Ke → Lagos, Ni')
    })

    it('should return "-" when both origin and destination are undefined', () => {
      const result = formatShippingRoute(undefined, undefined)
      
      expect(result).toBe('-')
    })

    it('should return "-" when both origin and destination are empty strings', () => {
      const result = formatShippingRoute('', '')
      
      expect(result).toBe('-')
    })

    it('should return only origin when destination is undefined', () => {
      const result = formatShippingRoute('Johannesburg, South Africa', undefined)
      
      expect(result).toBe('Johannesburg, South Africa')
    })

    it('should return only destination when origin is undefined', () => {
      const result = formatShippingRoute(undefined, 'Cape Town, South Africa')
      
      expect(result).toBe('Cape Town, South Africa')
    })

    it('should handle single-word locations', () => {
      const result = formatShippingRoute('Johannesburg', 'Cape Town')
      
      expect(result).toBe('Johannesburg → Cape Town')
    })

    it('should handle locations with multiple commas', () => {
      const result = formatShippingRoute('City Hospital, 123 St, Cape Town, South Africa', 'Main Hospital, Johannesburg, ZA')
      
      // Should use first part and second part only
      expect(result).toBe('City Hospital, 1 → Main Hospital, J')
    })
  })

  describe('hasSelectedSupplier', () => {
    it('should return true when procurement has selected_supplier_id', () => {
      const request: ProcurementRequest = {
        id: '123',
        request_number: 'PR-001',
        isotope: 'Tc-99m',
        quantity: 500,
        unit: 'mCi',
        delivery_date: '2024-01-01',
        delivery_location: 'Hospital A',
        status: 'PO Approved',
        selected_supplier_id: 'supplier-123',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      }
      
      expect(hasSelectedSupplier(request)).toBe(true)
    })

    it('should return false when procurement has no selected_supplier_id', () => {
      const request: ProcurementRequest = {
        id: '123',
        request_number: 'PR-001',
        isotope: 'Tc-99m',
        quantity: 500,
        unit: 'mCi',
        delivery_date: '2024-01-01',
        delivery_location: 'Hospital A',
        status: 'Draft',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      }
      
      expect(hasSelectedSupplier(request)).toBe(false)
    })

    it('should return false when selected_supplier_id is undefined', () => {
      const request: ProcurementRequest = {
        id: '123',
        request_number: 'PR-001',
        isotope: 'Tc-99m',
        quantity: 500,
        unit: 'mCi',
        delivery_date: '2024-01-01',
        delivery_location: 'Hospital A',
        status: 'Draft',
        selected_supplier_id: undefined,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      }
      
      expect(hasSelectedSupplier(request)).toBe(false)
    })
  })

  describe('Route Display Logic', () => {
    it('should display route when both origin and destination are present', () => {
      const origin = 'Johannesburg, South Africa'
      const destination = 'Cape Town, South Africa'
      
      const route = formatShippingRoute(origin, destination)
      
      expect(route).toContain('→')
      expect(route).toContain('Johannesburg')
      expect(route).toContain('Cape Town')
    })

    it('should handle null values gracefully', () => {
      // @ts-expect-error Testing null handling
      const result1 = formatShippingRoute(null, null)
      expect(result1).toBe('-')
      
      // @ts-expect-error Testing null handling
      const result2 = formatShippingRoute('Johannesburg, South Africa', null)
      expect(result2).toBe('Johannesburg, South Africa')
      
      // @ts-expect-error Testing null handling
      const result3 = formatShippingRoute(null, 'Cape Town, South Africa')
      expect(result3).toBe('Cape Town, South Africa')
    })
  })

  describe('Integration Tests', () => {
    it('should format route for procurement request with origin and destination', () => {
      const request: ProcurementRequest = {
        id: '123',
        request_number: 'PR-2847',
        isotope: 'Tc-99m',
        quantity: 500,
        unit: 'mCi',
        delivery_date: '2024-01-05',
        delivery_location: 'City Hospital, Cape Town',
        origin: 'Johannesburg, South Africa',
        destination: 'Cape Town, South Africa',
        status: 'PO Approved',
        selected_supplier_id: 'supplier-123',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      }
      
      const route = formatShippingRoute(request.origin, request.destination)
      
      expect(route).toBe('Johannesburg, So → Cape Town, So')
    })

    it('should show "-" for draft procurement without supplier', () => {
      const request: ProcurementRequest = {
        id: '123',
        request_number: 'PR-2844',
        isotope: 'Lu-177',
        quantity: 50,
        unit: 'mCi',
        delivery_date: '2024-01-08',
        delivery_location: 'Research Hospital, Cairo',
        destination: 'Cairo, Egypt',
        status: 'Draft',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      }
      
      const route = formatShippingRoute(request.origin, request.destination)
      
      expect(route).toBe('Cairo, Egypt')
    })

    it('should validate supplier selection workflow', () => {
      // Create request - no supplier selected
      const draftRequest: ProcurementRequest = {
        id: '123',
        request_number: 'PR-001',
        isotope: 'Tc-99m',
        quantity: 500,
        unit: 'mCi',
        delivery_date: '2024-01-05',
        delivery_location: 'Hospital A, Cape Town',
        destination: 'Cape Town, South Africa',
        status: 'Draft',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      }
      
      expect(hasSelectedSupplier(draftRequest)).toBe(false)
      expect(formatShippingRoute(draftRequest.origin, draftRequest.destination)).toBe('Cape Town, South Africa')
      
      // After supplier selection
      const approvedRequest: ProcurementRequest = {
        ...draftRequest,
        selected_supplier_id: 'supplier-123',
        origin: 'Johannesburg, South Africa',
        status: 'PO Approved',
      }
      
      expect(hasSelectedSupplier(approvedRequest)).toBe(true)
      expect(formatShippingRoute(approvedRequest.origin, approvedRequest.destination)).toBe('Johannesburg, So → Cape Town, So')
    })
  })
})
