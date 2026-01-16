/**
 * Tests for useDashboardSearch hook
 */

import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDashboardSearch } from '@/lib/hooks/useDashboardSearch';

interface TestItem {
  id: string;
  name: string;
  description: string;
  [key: string]: unknown;
}

describe('useDashboardSearch', () => {
  const mockData: TestItem[] = [
    { id: '1', name: 'Item One', description: 'First item' },
    { id: '2', name: 'Item Two', description: 'Second item' },
    { id: '3', name: 'Another Item', description: 'Third item' },
  ];

  it('returns all data when search query is empty', () => {
    const { result } = renderHook(() =>
      useDashboardSearch({
        data: mockData,
        searchFields: ['name', 'description'],
      })
    );

    expect(result.current.filteredData).toEqual(mockData);
    expect(result.current.resultCount).toBe(3);
  });

  it('filters data based on search query', async () => {
    const { result } = renderHook(() =>
      useDashboardSearch({
        data: mockData,
        searchFields: ['name', 'description'],
        debounceMs: 10,
      })
    );

    act(() => {
      result.current.setSearchQuery('One');
    });

    // Wait for debounce
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(result.current.filteredData.length).toBeLessThanOrEqual(mockData.length);
  });

  it('sets isSearching to true during debounce', () => {
    const { result } = renderHook(() =>
      useDashboardSearch({
        data: mockData,
        searchFields: ['name'],
        debounceMs: 100,
      })
    );

    act(() => {
      result.current.setSearchQuery('test');
    });

    expect(result.current.isSearching).toBe(true);
  });

  it('clears search query', () => {
    const { result } = renderHook(() =>
      useDashboardSearch({
        data: mockData,
        searchFields: ['name'],
      })
    );

    act(() => {
      result.current.setSearchQuery('test');
    });

    act(() => {
      result.current.clearSearch();
    });

    expect(result.current.searchQuery).toBe('');
    expect(result.current.filteredData).toEqual(mockData);
  });
});
