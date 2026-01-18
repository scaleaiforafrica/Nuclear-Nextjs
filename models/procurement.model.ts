// Procurement model - Data types for procurement system

/**
 * Procurement request status workflow
 */
export type ProcurementStatus = 
  | 'Draft' 
  | 'Pending Quotes' 
  | 'Quotes Received' 
  | 'PO Approved' 
  | 'Completed' 
  | 'Cancelled';

/**
 * Unit of measurement for isotope activity
 */
export type ActivityUnit = 'mCi' | 'GBq';

/**
 * Preferred delivery time window
 */
export type DeliveryTimeWindow = 'Morning' | 'Afternoon' | 'Evening';

/**
 * Full procurement request entity
 */
export interface ProcurementRequest {
  id: string;
  request_number: string;
  isotope: string;
  quantity: number;
  unit: ActivityUnit;
  delivery_date: string;
  delivery_time_window?: DeliveryTimeWindow;
  delivery_location: string;
  origin?: string;
  destination?: string;
  selected_supplier_id?: string;
  selected_supplier?: Supplier;
  status: ProcurementStatus;
  status_color?: string;
  clinical_indication?: string;
  special_instructions?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  quotes?: ProcurementQuote[];
}

/**
 * Supplier/manufacturer entity
 */
export interface Supplier {
  id: string;
  name: string;
  location: string;
  rating: number;
  contact_email?: string;
  contact_phone?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Quote from a supplier for a procurement request
 */
export interface ProcurementQuote {
  id: string;
  procurement_request_id: string;
  supplier_id: string;
  supplier?: Supplier;
  product_cost: number;
  shipping_cost: number;
  insurance_cost: number;
  total_cost: number;
  delivery_time: string;
  activity_at_arrival: string;
  is_best_value: boolean;
  compliance_passed: boolean;
  quote_valid_until?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Data required to create a new procurement request
 */
export interface CreateProcurementRequest {
  isotope: string;
  quantity: number;
  unit: ActivityUnit;
  delivery_date: string;
  delivery_time_window?: DeliveryTimeWindow;
  delivery_location: string;
  destination?: string;
  clinical_indication?: string;
  special_instructions?: string;
  status?: ProcurementStatus;
}

/**
 * Data for updating an existing procurement request
 */
export interface UpdateProcurementRequest extends Partial<CreateProcurementRequest> {
  id: string;
  status?: ProcurementStatus;
  origin?: string;
  destination?: string;
  selected_supplier_id?: string;
}

/**
 * Data for creating a new quote
 */
export interface CreateProcurementQuote {
  procurement_request_id: string;
  supplier_id: string;
  product_cost: number;
  shipping_cost: number;
  insurance_cost: number;
  delivery_time: string;
  activity_at_arrival: string;
  is_best_value?: boolean;
  compliance_passed?: boolean;
  quote_valid_until?: string;
}

/**
 * Filter criteria for procurement requests
 */
export interface ProcurementFilter {
  status?: ProcurementStatus;
  isotope?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  per_page?: number;
}

/**
 * Procurement statistics for dashboard
 */
export interface ProcurementStats {
  total_requests: number;
  pending_quotes: number;
  quotes_received: number;
  po_approved: number;
  completed: number;
  cancelled: number;
}

/**
 * Status color mapping helper
 */
export const STATUS_COLORS: Record<ProcurementStatus, string> = {
  'Draft': 'bg-gray-100 text-gray-700',
  'Pending Quotes': 'bg-amber-100 text-amber-700',
  'Quotes Received': 'bg-blue-100 text-blue-700',
  'PO Approved': 'bg-green-100 text-green-700',
  'Completed': 'bg-purple-100 text-purple-700',
  'Cancelled': 'bg-red-100 text-red-700',
};

/**
 * Get status color for a given status
 */
export function getProcurementStatusColor(status: ProcurementStatus): string {
  return STATUS_COLORS[status] || 'bg-gray-100 text-gray-700';
}

/**
 * Check if a request can be edited
 */
export function canEditRequest(status: ProcurementStatus): boolean {
  return status === 'Draft' || status === 'Pending Quotes';
}

/**
 * Check if a request can be cancelled
 */
export function canCancelRequest(status: ProcurementStatus): boolean {
  return status !== 'Completed' && status !== 'Cancelled';
}

/**
 * Check if quotes can be viewed for a request
 */
export function canViewQuotes(status: ProcurementStatus): boolean {
  return status === 'Quotes Received' || status === 'PO Approved' || status === 'Completed';
}

/**
 * Format origin → destination route display
 * Abbreviates country names for compact display
 */
export function formatShippingRoute(origin?: string, destination?: string): string {
  if (!origin && !destination) return '-';
  
  const formatLocation = (loc: string) => {
    // Validate input
    if (!loc || !loc.trim()) return '';
    
    // Split by comma and take last two parts (city, country)
    const parts = loc.split(',').map(p => p.trim()).filter(p => p);
    
    if (parts.length >= 2) {
      // Use last two parts: city and country
      const city = parts[parts.length - 2];
      const country = parts[parts.length - 1];
      // Abbreviate country to 2 letters (simple approach for display purposes)
      // For production, consider using a library like country-list for ISO codes
      return `${city}, ${country.substring(0, 2)}`;
    }
    // If not in expected format, return as is
    return loc.trim();
  };
  
  if (origin && destination) {
    const formattedOrigin = formatLocation(origin);
    const formattedDestination = formatLocation(destination);
    if (formattedOrigin && formattedDestination) {
      return `${formattedOrigin} → ${formattedDestination}`;
    }
  }
  
  return origin || destination || '-';
}

/**
 * Check if procurement has a selected supplier
 */
export function hasSelectedSupplier(request: ProcurementRequest): boolean {
  return !!request.selected_supplier_id;
}
