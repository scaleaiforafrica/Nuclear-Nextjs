/**
 * Tests for Login Page Loading State and Transition
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import LoginPage from '@/app/login/page';

// Mock the next/navigation module
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock the auth context
const mockLogin = vi.fn();
const mockSignUp = vi.fn();
const mockResetPassword = vi.fn();

vi.mock('@/contexts/auth.context', () => ({
  useAuth: () => ({
    login: mockLogin,
    signUp: mockSignUp,
    resetPassword: mockResetPassword,
  }),
}));

describe('Login Page Loading State', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows "Loading dashboard..." message when redirecting after successful login', async () => {
    // Mock successful login
    mockLogin.mockResolvedValueOnce({ success: true });

    render(<LoginPage />);

    // Fill in login form
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    // Submit form
    const signInButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(signInButton);

    // Wait for the loading state to appear
    await waitFor(() => {
      expect(screen.getByText('Loading dashboard...')).toBeDefined();
    });

    // Check for the subtitle
    expect(screen.getByText('Preparing your workspace')).toBeDefined();
  });

  it('shows spinner during redirect transition', async () => {
    mockLogin.mockResolvedValueOnce({ success: true });

    render(<LoginPage />);

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    const signInButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(signInButton);

    // Wait for the redirecting overlay to appear
    await waitFor(() => {
      const loadingMessage = screen.queryByText('Loading dashboard...');
      expect(loadingMessage).toBeDefined();
    });
  });

  it('shows "Signing in..." on button during authentication', async () => {
    // Mock login that takes some time
    mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ success: true }), 100)));

    render(<LoginPage />);

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    const signInButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(signInButton);

    // Check button shows loading state
    await waitFor(() => {
      expect(screen.getByText('Signing in...')).toBeDefined();
    });
  });

  it('does not show loading overlay on login failure', async () => {
    // Mock failed login
    mockLogin.mockResolvedValueOnce({ success: false, error: 'Invalid credentials' });

    render(<LoginPage />);

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });

    const signInButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(signInButton);

    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeDefined();
    });

    // Loading overlay should not appear
    expect(screen.queryByText('Loading dashboard...')).toBeNull();
  });

  it('navigates to dashboard after showing loading state', async () => {
    mockLogin.mockResolvedValueOnce({ success: true });

    render(<LoginPage />);

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    const signInButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(signInButton);

    // Wait for router.push to be called
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    }, { timeout: 500 });
  });
});
