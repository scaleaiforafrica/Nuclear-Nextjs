import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrandButton } from '../components/BrandButton';
import { describe, it, expect } from 'vitest';

describe('BrandButton', () => {
  it('renders children', () => {
    render(<BrandButton>Click me</BrandButton>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('applies variant and size classes', () => {
    render(<BrandButton variant="secondary" size="lg">Action</BrandButton>);
    const btn = screen.getByRole('button', { name: /action/i });
    expect(btn).toHaveClass('btn', 'btn--secondary', 'btn--lg');
  });

  it('sets aria-busy when loading', () => {
    render(<BrandButton loading>Saving</BrandButton>);
    const btn = screen.getByRole('button', { name: /saving/i });
    expect(btn).toHaveAttribute('aria-busy', 'true');
    expect(btn).toBeDisabled();
  });

  it('disables button when disabled prop is true', () => {
    render(<BrandButton disabled>Disabled</BrandButton>);
    const btn = screen.getByRole('button', { name: /disabled/i });
    expect(btn).toBeDisabled();
  });

  it('applies custom className', () => {
    render(<BrandButton className="custom-class">Custom</BrandButton>);
    const btn = screen.getByRole('button', { name: /custom/i });
    expect(btn).toHaveClass('btn', 'btn--primary', 'btn--md', 'custom-class');
  });
});
