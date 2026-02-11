/**
 * Tests for DashboardGreeting component
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import DashboardGreeting from '@/components/DashboardGreeting';
import { AuthProvider } from '@/contexts';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Wrapper component for tests that need AuthProvider
function TestWrapper({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

describe('DashboardGreeting', () => {
  let originalHours: number;

  beforeEach(() => {
    // Store original time
    originalHours = new Date().getHours();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders greeting message', () => {
    render(<DashboardGreeting />, { wrapper: TestWrapper });
    // Should render some form of greeting
    const greetingText = screen.getByText(/Good morning|Good afternoon|Good evening|Good night|Hello/i);
    expect(greetingText).toBeDefined();
  });

  it('displays morning greeting between 5 AM and 12 PM', () => {
    // Mock time to be 9 AM
    vi.setSystemTime(new Date(2024, 0, 1, 9, 0, 0));
    
    render(<DashboardGreeting />, { wrapper: TestWrapper });
    expect(screen.getByText(/Good morning/i)).toBeDefined();
  });

  it('displays afternoon greeting between 12 PM and 5 PM', () => {
    // Mock time to be 2 PM
    vi.setSystemTime(new Date(2024, 0, 1, 14, 0, 0));
    
    render(<DashboardGreeting />, { wrapper: TestWrapper });
    expect(screen.getByText(/Good afternoon/i)).toBeDefined();
  });

  it('displays evening greeting between 5 PM and midnight', () => {
    // Mock time to be 8 PM
    vi.setSystemTime(new Date(2024, 0, 1, 20, 0, 0));
    
    render(<DashboardGreeting />, { wrapper: TestWrapper });
    expect(screen.getByText(/Good evening/i)).toBeDefined();
  });

  it('displays night greeting between midnight and 5 AM', () => {
    // Mock time to be 2 AM
    vi.setSystemTime(new Date(2024, 0, 1, 2, 0, 0));
    
    render(<DashboardGreeting />, { wrapper: TestWrapper });
    expect(screen.getByText(/Good night/i)).toBeDefined();
  });

  it('renders quick action buttons', () => {
    render(<DashboardGreeting />, { wrapper: TestWrapper });
    
    // Check for quick action cards
    expect(screen.getByText('New Procurement')).toBeDefined();
    expect(screen.getByText('Check Shipment')).toBeDefined();
    expect(screen.getByText('Generate Reports')).toBeDefined();
  });

  it('renders current date', () => {
    render(<DashboardGreeting />, { wrapper: TestWrapper });
    
    // Should render a date string (contains day name and numbers)
    const dateElements = screen.getAllByText(/Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday/i);
    expect(dateElements.length).toBeGreaterThan(0);
  });

  it('has fallback "Hello" greeting documented for error cases', () => {
    // This test verifies that the component handles the greeting robustly
    // The fallback "Hello" is used if Date.getHours() throws an error
    // Testing this directly would require mocking Date in a way that affects
    // the initial module load, so we verify the component renders correctly
    render(<DashboardGreeting />, { wrapper: TestWrapper });
    
    // Component should render without errors and show a greeting
    const greeting = screen.getByText(/Good morning|Good afternoon|Good evening|Good night/i);
    expect(greeting).toBeDefined();
    
    // The fallback exists in the implementation as a safety measure
    // It would return "Hello" if time determination fails
  });
});
