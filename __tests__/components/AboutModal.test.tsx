/**
 * Tests for AboutModal component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AboutModal } from '@/components/dashboard/AboutModal';

describe('AboutModal', () => {
  const mockAppInfo = {
    name: 'Nuclear Supply Chain',
    version: '1.0.0',
    domain: 'nuclear-nextjs.vercel.app',
    description: 'Secure medical isotope procurement and logistics platform',
    supportEmail: 'support@example.com',
    documentationUrl: '/docs',
    lastUpdated: '2026-01-16',
  };

  it('renders modal when open', () => {
    render(
      <AboutModal
        isOpen={true}
        onClose={vi.fn()}
        appInfo={mockAppInfo}
      />
    );
    expect(screen.getByText('Nuclear Supply Chain')).toBeDefined();
  });

  it('displays app version', () => {
    render(
      <AboutModal
        isOpen={true}
        onClose={vi.fn()}
        appInfo={mockAppInfo}
      />
    );
    expect(screen.getByText('1.0.0')).toBeDefined();
  });

  it('displays app description', () => {
    render(
      <AboutModal
        isOpen={true}
        onClose={vi.fn()}
        appInfo={mockAppInfo}
      />
    );
    expect(screen.getByText('Secure medical isotope procurement and logistics platform')).toBeDefined();
  });

  it('displays support email', () => {
    render(
      <AboutModal
        isOpen={true}
        onClose={vi.fn()}
        appInfo={mockAppInfo}
      />
    );
    expect(screen.getByText('support@example.com')).toBeDefined();
  });

  it('displays domain information', () => {
    render(
      <AboutModal
        isOpen={true}
        onClose={vi.fn()}
        appInfo={mockAppInfo}
      />
    );
    expect(screen.getByText('nuclear-nextjs.vercel.app')).toBeDefined();
  });

  it('renders with version label', () => {
    render(
      <AboutModal
        isOpen={true}
        onClose={vi.fn()}
        appInfo={mockAppInfo}
      />
    );
    expect(screen.getByText('Version')).toBeDefined();
  });
});
