/**
 * Tests for DashboardTopNav component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DashboardTopNav } from '@/components/dashboard/DashboardTopNav';
import { NotificationProvider } from '@/contexts';

// Wrapper component for tests that need NotificationProvider
function TestWrapper({ children }: { children: React.ReactNode }) {
  return <NotificationProvider>{children}</NotificationProvider>;
}

describe('DashboardTopNav', () => {
  const defaultProps = {
    pageTitle: 'Dashboard',
    onMobileMenuToggle: vi.fn(),
    mobileMenuOpen: false,
    searchPlaceholder: 'Search...',
    userName: 'John Doe',
    userInitials: 'JD',
  };

  it('renders page title correctly', () => {
    render(<DashboardTopNav {...defaultProps} />, { wrapper: TestWrapper });
    expect(screen.getByText('Dashboard')).toBeDefined();
  });

  it('renders user initials', () => {
    render(<DashboardTopNav {...defaultProps} />, { wrapper: TestWrapper });
    expect(screen.getByText('JD')).toBeDefined();
  });

  it('renders search input on desktop', () => {
    render(<DashboardTopNav {...defaultProps} />, { wrapper: TestWrapper });
    const searchInputs = screen.getAllByLabelText('Search');
    expect(searchInputs.length).toBeGreaterThan(0);
  });

  it('calls onMobileMenuToggle when menu button is clicked', () => {
    const onToggle = vi.fn();
    render(<DashboardTopNav {...defaultProps} onMobileMenuToggle={onToggle} />, { wrapper: TestWrapper });
    const menuButton = screen.getByLabelText('Open menu');
    menuButton.click();
    expect(onToggle).toHaveBeenCalledOnce();
  });

  it('renders with accessibility attributes', () => {
    render(<DashboardTopNav {...defaultProps} />, { wrapper: TestWrapper });
    const menuButton = screen.getByLabelText('Open menu');
    expect(menuButton.getAttribute('aria-expanded')).toBe('false');
  });
});
