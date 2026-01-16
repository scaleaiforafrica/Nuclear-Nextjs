/**
 * useDashboardSearch hook
 * Provides search functionality with debouncing and filtering for dashboard tables
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import { searchItems } from '@/lib/search-utils';
import type { SearchableItem } from '@/models/search.model';

export interface UseDashboardSearchOptions<T extends SearchableItem> {
  data: T[];
  searchFields: (keyof T)[];
  debounceMs?: number;
}

export interface UseDashboardSearchResult<T extends SearchableItem> {
  filteredData: T[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearching: boolean;
  resultCount: number;
  clearSearch: () => void;
}

/**
 * Hook for dashboard search with debouncing
 */
export function useDashboardSearch<T extends SearchableItem>({
  data,
  searchFields,
  debounceMs = 300,
}: UseDashboardSearchOptions<T>): UseDashboardSearchResult<T> {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Debounce search query
  useEffect(() => {
    setIsSearching(true);
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setIsSearching(false);
    }, debounceMs);

    return () => {
      clearTimeout(timer);
    };
  }, [searchQuery, debounceMs]);

  // Filter data based on debounced query
  const filteredData = useMemo(() => {
    if (!debouncedQuery.trim()) {
      return data;
    }

    return searchItems(data, debouncedQuery, searchFields);
  }, [data, debouncedQuery, searchFields]);

  const clearSearch = () => {
    setSearchQuery('');
    setDebouncedQuery('');
  };

  return {
    filteredData,
    searchQuery,
    setSearchQuery,
    isSearching,
    resultCount: filteredData.length,
    clearSearch,
  };
}
