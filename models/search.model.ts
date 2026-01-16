/**
 * Search models - Type definitions for dashboard search functionality
 */

export interface SearchResult {
  id: string;
  type: 'shipment' | 'procurement' | 'compliance' | 'report';
  title: string;
  subtitle: string;
  url: string;
  metadata?: Record<string, unknown>;
}

export interface SearchState {
  query: string;
  results: SearchResult[];
  isLoading: boolean;
  error: string | null;
}

export interface SearchableItem {
  id: string;
  [key: string]: unknown;
}
