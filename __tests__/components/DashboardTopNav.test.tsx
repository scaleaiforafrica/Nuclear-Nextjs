/**
 * Tests for DashboardTopNav component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DashboardTopNav } from '@/components/dashboard/DashboardTopNav';

describe('DashboardTopNav', () => {
  const defaultProps = {
    pageTitle: 'Dashboard',
    onMobileMenuToggle: vi.fn(),
    mobileMenuOpen: false,
    notificationCount: 3,
    searchPlaceholder: 'Search...',
    userName: 'John Doe',
    userInitials: 'JD',
  };

  it('renders page title correctly', () => {
    render(<DashboardTopNav {...defaultProps} />);
    expect(screen.getByText('Dashboard')).toBeDefined();
  });

  it('renders user initials', () => {
    render(<DashboardTopNav {...defaultProps} />);
    expect(screen.getByText('JD')).toBeDefined();
  });

  it('displays notification count when provided', () => {
    render(<DashboardTopNav {...defaultProps} notificationCount={5} />);
    expect(screen.getByText('5')).toBeDefined();
  });

  it('renders search input on desktop', () => {
    render(<DashboardTopNav {...defaultProps} />);
    const searchInputs = screen.getAllByLabelText('Search');
    expect(searchInputs.length).toBeGreaterThan(0);
  });

  it('calls onMobileMenuToggle when menu button is clicked', () => {
    const onToggle = vi.fn();
    render(<DashboardTopNav {...defaultProps} onMobileMenuToggle={onToggle} />);
    const menuButton = screen.getByLabelText('Open menu');
    menuButton.click();
    expect(onToggle).toHaveBeenCalledOnce();
  });

  it('renders with accessibility attributes', () => {
    render(<DashboardTopNav {...defaultProps} />);
    const menuButton = screen.getByLabelText('Open menu');
    expect(menuButton.getAttribute('aria-expanded')).toBe('false');
  });
});
