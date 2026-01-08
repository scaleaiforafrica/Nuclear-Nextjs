import { describe, it, expect, beforeEach } from 'vitest'
import * as fc from 'fast-check'
import type { Shipment, ShipmentStatus, ShipmentFilter } from '../../models/shipment.model'
import { 
  filterShipments, 
  sortShipments,
  setShipments,
  resetShipments,
  type SortCriteria
} from '../../controllers/shipment.controller'

// Arbitraries for generating valid test data
const shipmentStatusArb = fc.constantFrom<ShipmentStatus>(
  'In Transit', 
  'At Customs', 
  'Dispatched', 
  'Delivered', 
  'Pending'
)

const shipmentArb = fc.record<Shipment>({
  id: fc.string({ minLength: 1, maxLength: 50 }),
  isotope: fc.constantFrom('Tc-99m', 'I-131', 'Mo-99', 'F-18', 'Ga-68'),
  origin: fc.string({ minLength: 1, maxLength: 100 }),
  destination: fc.string({ minLength: 1, maxLength: 100 }),
  status: shipmentStatusArb,
  eta: fc.string({ minLength: 1, maxLength: 50 }),
  statusColor: fc.string({ minLength: 1, maxLength: 50 }),
})

const shipmentListArb = fc.array(shipmentArb, { minLength: 0, maxLength: 20 })

const filterArb = fc.record<ShipmentFilter>({
  status: fc.option(shipmentStatusArb, { nil: undefined }),
  isotope: fc.option(fc.constantFrom('Tc-99m', 'I-131', 'Mo-99', 'F-18', 'Ga-68'), { nil: undefined }),
  origin: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
  destination: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
})

const sortCriteriaArb = fc.constantFrom<SortCriteria>('id', 'isotope', 'origin', 'destination', 'status', 'eta')

describe('Data Filtering Correctness', () => {
  /**
   * Feature: nextjs-mvc-conversion, Property 7: Data Filtering Correctness
   * *For any* filter criteria applied to a dataset, the filtered results SHALL 
   * contain only items that match all specified filter conditions.
   * **Validates: Requirements 5.3**
   */

  beforeEach(() => {
    resetShipments()
  })

  it('should return only shipments matching status filter for any shipment list and status', () => {
    fc.assert(
      fc.property(
        shipmentListArb,
        shipmentStatusArb,
        (shipments, status) => {
          const filter: ShipmentFilter = { status }
          const result = filterShipments(shipments, filter)
          
          // All results must have the specified status
          result.forEach(shipment => {
            expect(shipment.status).toBe(status)
          })
          
          // Result should not contain any shipments with different status
          const expectedCount = shipments.filter(s => s.status === status).length
          expect(result.length).toBe(expectedCount)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should return only shipments matching isotope filter for any shipment list and isotope', () => {
    fc.assert(
      fc.property(
        shipmentListArb,
        fc.constantFrom('Tc-99m', 'I-131', 'Mo-99', 'F-18', 'Ga-68'),
        (shipments, isotope) => {
          const filter: ShipmentFilter = { isotope }
          const result = filterShipments(shipments, filter)
          
          // All results must have the specified isotope
          result.forEach(shipment => {
            expect(shipment.isotope).toBe(isotope)
          })
          
          // Result should not contain any shipments with different isotope
          const expectedCount = shipments.filter(s => s.isotope === isotope).length
          expect(result.length).toBe(expectedCount)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should return only shipments matching origin filter (case-insensitive partial match)', () => {
    fc.assert(
      fc.property(
        shipmentListArb,
        fc.string({ minLength: 1, maxLength: 10 }),
        (shipments, originSearch) => {
          const filter: ShipmentFilter = { origin: originSearch }
          const result = filterShipments(shipments, filter)
          
          // All results must contain the search string in origin (case-insensitive)
          result.forEach(shipment => {
            expect(shipment.origin.toLowerCase()).toContain(originSearch.toLowerCase())
          })
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should return only shipments matching destination filter (case-insensitive partial match)', () => {
    fc.assert(
      fc.property(
        shipmentListArb,
        fc.string({ minLength: 1, maxLength: 10 }),
        (shipments, destSearch) => {
          const filter: ShipmentFilter = { destination: destSearch }
          const result = filterShipments(shipments, filter)
          
          // All results must contain the search string in destination (case-insensitive)
          result.forEach(shipment => {
            expect(shipment.destination.toLowerCase()).toContain(destSearch.toLowerCase())
          })
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should return only shipments matching ALL filter criteria when multiple filters applied', () => {
    fc.assert(
      fc.property(
        shipmentListArb,
        shipmentStatusArb,
        fc.constantFrom('Tc-99m', 'I-131', 'Mo-99', 'F-18', 'Ga-68'),
        (shipments, status, isotope) => {
          const filter: ShipmentFilter = { status, isotope }
          const result = filterShipments(shipments, filter)
          
          // All results must match BOTH criteria
          result.forEach(shipment => {
            expect(shipment.status).toBe(status)
            expect(shipment.isotope).toBe(isotope)
          })
          
          // Count should match expected
          const expectedCount = shipments.filter(s => 
            s.status === status && s.isotope === isotope
          ).length
          expect(result.length).toBe(expectedCount)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should return all shipments when filter is empty', () => {
    fc.assert(
      fc.property(
        shipmentListArb,
        (shipments) => {
          const filter: ShipmentFilter = {}
          const result = filterShipments(shipments, filter)
          
          // Should return all shipments
          expect(result.length).toBe(shipments.length)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should return filtered results as subset of original list', () => {
    fc.assert(
      fc.property(
        shipmentListArb,
        filterArb,
        (shipments, filter) => {
          const result = filterShipments(shipments, filter)
          
          // Result length should be <= original length
          expect(result.length).toBeLessThanOrEqual(shipments.length)
          
          // Every result should exist in original list
          result.forEach(shipment => {
            expect(shipments).toContainEqual(shipment)
          })
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should maintain sort order after sorting for any criteria', () => {
    fc.assert(
      fc.property(
        shipmentListArb,
        sortCriteriaArb,
        (shipments, sortBy) => {
          const sortedAsc = sortShipments(shipments, sortBy, 'asc')
          const sortedDesc = sortShipments(shipments, sortBy, 'desc')
          
          // Verify ascending order
          for (let i = 1; i < sortedAsc.length; i++) {
            expect(sortedAsc[i][sortBy] >= sortedAsc[i-1][sortBy]).toBe(true)
          }
          
          // Verify descending order
          for (let i = 1; i < sortedDesc.length; i++) {
            expect(sortedDesc[i][sortBy] <= sortedDesc[i-1][sortBy]).toBe(true)
          }
          
          // Both should have same length as original
          expect(sortedAsc.length).toBe(shipments.length)
          expect(sortedDesc.length).toBe(shipments.length)
        }
      ),
      { numRuns: 100 }
    )
  })
})
