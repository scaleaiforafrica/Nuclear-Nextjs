/**
 * Tests for search utilities
 */

import { describe, it, expect } from 'vitest';
import { fuzzyMatch, searchItems, highlightMatch, rankSearchResults } from '@/lib/search-utils';

describe('search-utils', () => {
  describe('fuzzyMatch', () => {
    it('returns 1 for exact match', () => {
      expect(fuzzyMatch('test', 'test')).toBe(1);
    });

    it('returns high score for starts with match', () => {
      const score = fuzzyMatch('test', 'testing');
      expect(score).toBeGreaterThan(0.8);
    });

    it('returns good score for contains match', () => {
      const score = fuzzyMatch('test', 'my test string');
      expect(score).toBeGreaterThan(0.7);
    });

    it('returns 0 for no match', () => {
      const score = fuzzyMatch('test', 'xyz');
      expect(score).toBe(0);
    });

    it('is case insensitive', () => {
      expect(fuzzyMatch('TEST', 'test')).toBe(1);
    });
  });

  describe('searchItems', () => {
    const items = [
      { id: '1', name: 'Apple', category: 'Fruit' },
      { id: '2', name: 'Banana', category: 'Fruit' },
      { id: '3', name: 'Carrot', category: 'Vegetable' },
    ];

    it('returns all items when query is empty', () => {
      const results = searchItems(items, '', ['name']);
      expect(results).toEqual(items);
    });

    it('filters items based on search fields', () => {
      const results = searchItems(items, 'apple', ['name']);
      expect(results.length).toBe(1);
      expect(results[0].name).toBe('Apple');
    });

    it('searches across multiple fields', () => {
      const results = searchItems(items, 'fruit', ['name', 'category']);
      expect(results.length).toBe(2);
    });

    it('sorts results by relevance', () => {
      const results = searchItems(items, 'a', ['name']);
      expect(results[0].name).toBe('Apple');
    });
  });

  describe('highlightMatch', () => {
    it('returns original text when query is empty', () => {
      expect(highlightMatch('test string', '')).toBe('test string');
    });

    it('wraps matched text in mark tag', () => {
      const result = highlightMatch('test string', 'test');
      expect(result).toContain('<mark');
      expect(result).toContain('test');
      expect(result).toContain('</mark>');
    });

    it('returns original text when no match', () => {
      expect(highlightMatch('test string', 'xyz')).toBe('test string');
    });
  });

  describe('rankSearchResults', () => {
    const items = [
      { id: '1', title: 'Testing' },
      { id: '2', title: 'Test' },
      { id: '3', title: 'My test file' },
    ];

    it('ranks exact matches higher', () => {
      const ranked = rankSearchResults(items, 'test', 'title');
      expect(ranked[0].title).toBe('Test');
    });

    it('ranks starts-with matches high', () => {
      const ranked = rankSearchResults(items, 'test', 'title');
      expect(ranked[0].title).toBe('Test');
      expect(ranked[1].title).toBe('Testing');
    });
  });
});
