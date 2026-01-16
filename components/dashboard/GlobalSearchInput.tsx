/**
 * GlobalSearchInput Component
 * Full-width search input for dashboard with clear button and keyboard shortcuts
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';

export interface GlobalSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isLoading?: boolean;
  resultCount?: number;
  className?: string;
  onFocus?: () => void;
  onBlur?: () => void;
}

export function GlobalSearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  isLoading = false,
  resultCount,
  className = '',
}: GlobalSearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Handle Escape key to clear search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && value) {
        onChange('');
        inputRef.current?.blur();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [value, onChange]);

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  return (
    <div className={`relative w-full ${className}`}>
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={`w-full pl-10 ${value || isLoading ? 'pr-20' : 'pr-4'} py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent min-h-[44px] transition-all`}
          aria-label="Search dashboard"
          aria-describedby={resultCount !== undefined ? 'search-result-count' : undefined}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="w-5 h-5 text-gray-400 animate-spin" aria-hidden="true" />
            <span className="sr-only">Searching...</span>
          </div>
        )}
        {!isLoading && value && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors touch-manipulation"
            aria-label="Clear search"
          >
            <X className="w-4 h-4 text-gray-400" aria-hidden="true" />
          </button>
        )}
      </div>
      {isFocused && resultCount !== undefined && value && (
        <div
          id="search-result-count"
          className="absolute top-full mt-1 text-xs text-gray-500 px-3"
          role="status"
          aria-live="polite"
        >
          {resultCount === 0 ? 'No results found' : `${resultCount} result${resultCount !== 1 ? 's' : ''}`}
        </div>
      )}
    </div>
  );
}
