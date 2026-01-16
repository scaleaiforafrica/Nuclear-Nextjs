/**
 * Search utilities for dashboard search functionality
 * Provides fuzzy search, highlighting, and result ranking
 */

import type { SearchableItem } from '@/models/search.model';

/**
 * Normalize string for fuzzy search comparison
 */
function normalizeString(str: string): string {
  return str.toLowerCase().trim();
}

/**
 * Calculate Levenshtein distance between two strings
 * Used for fuzzy matching
 */
function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix: number[][] = [];

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[len1][len2];
}

/**
 * Check if query matches value with fuzzy search
 * Returns match score (0-1, higher is better)
 */
export function fuzzyMatch(query: string, value: string, threshold = 0.6): number {
  const normalizedQuery = normalizeString(query);
  const normalizedValue = normalizeString(value);

  // Exact match
  if (normalizedValue === normalizedQuery) {
    return 1;
  }

  // Starts with query
  if (normalizedValue.startsWith(normalizedQuery)) {
    return 0.9;
  }

  // Contains query
  if (normalizedValue.includes(normalizedQuery)) {
    return 0.8;
  }

  // Fuzzy match using Levenshtein distance
  const distance = levenshteinDistance(normalizedQuery, normalizedValue);
  const maxLength = Math.max(normalizedQuery.length, normalizedValue.length);
  const similarity = 1 - distance / maxLength;

  return similarity >= threshold ? similarity * 0.7 : 0;
}

/**
 * Search items across multiple fields
 */
export function searchItems<T extends SearchableItem>(
  items: T[],
  query: string,
  searchFields: (keyof T)[],
  threshold = 0.6
): T[] {
  if (!query.trim()) {
    return items;
  }

  const scoredItems = items
    .map((item) => {
      let maxScore = 0;

      for (const field of searchFields) {
        const value = item[field];
        if (typeof value === 'string') {
          const score = fuzzyMatch(query, value, threshold);
          maxScore = Math.max(maxScore, score);
        }
      }

      return { item, score: maxScore };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);

  return scoredItems.map(({ item }) => item);
}

/**
 * Highlight search query matches in text
 * Returns an object with parts for safe rendering
 */
export function highlightMatch(text: string, query: string): { text: string; highlighted: boolean }[] {
  if (!query.trim()) {
    return [{ text, highlighted: false }];
  }

  const normalizedQuery = normalizeString(query);
  const normalizedText = normalizeString(text);
  const index = normalizedText.indexOf(normalizedQuery);

  if (index === -1) {
    return [{ text, highlighted: false }];
  }

  const before = text.substring(0, index);
  const match = text.substring(index, index + query.length);
  const after = text.substring(index + query.length);

  const parts: { text: string; highlighted: boolean }[] = [];
  if (before) parts.push({ text: before, highlighted: false });
  if (match) parts.push({ text: match, highlighted: true });
  if (after) parts.push({ text: after, highlighted: false });

  return parts;
}

/**
 * Rank search results by relevance
 */
export function rankSearchResults<T extends SearchableItem>(
  results: T[],
  query: string,
  primaryField: keyof T
): T[] {
  return results.sort((a, b) => {
    const aValue = String(a[primaryField] || '');
    const bValue = String(b[primaryField] || '');
    const aScore = fuzzyMatch(query, aValue);
    const bScore = fuzzyMatch(query, bValue);
    return bScore - aScore;
  });
}
