import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PasswordStrengthMeter } from '@/components/ui/password-strength-meter'

describe('PasswordStrengthMeter', () => {
  it('does not render when password is empty', () => {
    const { container } = render(<PasswordStrengthMeter password="" />)
    expect(container.firstChild).toBeNull()
  })

  it('renders strength meter for weak password', () => {
    render(<PasswordStrengthMeter password="weak" />)
    expect(screen.getByText('Password strength:')).toBeInTheDocument()
    expect(screen.getByText('Weak')).toBeInTheDocument()
  })

  it('renders strength meter for strong password', () => {
    render(<PasswordStrengthMeter password="StrongP@ssw0rd!" />)
    expect(screen.getByText('Password strength:')).toBeInTheDocument()
    expect(screen.getByText('Strong')).toBeInTheDocument()
  })

  it('shows all requirement items when showRequirements is true', () => {
    render(<PasswordStrengthMeter password="test" showRequirements={true} />)
    
    expect(screen.getByText(/At least 8 characters/)).toBeInTheDocument()
    expect(screen.getByText(/One uppercase letter/)).toBeInTheDocument()
    expect(screen.getByText(/One lowercase letter/)).toBeInTheDocument()
    expect(screen.getByText(/One number/)).toBeInTheDocument()
    expect(screen.getByText(/One special character/)).toBeInTheDocument()
    expect(screen.getByText(/Not a common password/)).toBeInTheDocument()
  })

  it('does not show requirements when showRequirements is false', () => {
    render(<PasswordStrengthMeter password="test" showRequirements={false} />)
    
    expect(screen.queryByText(/At least 8 characters/)).not.toBeInTheDocument()
  })

  it('updates strength dynamically as password changes', () => {
    const { rerender } = render(<PasswordStrengthMeter password="weak" />)
    expect(screen.getByText('Weak')).toBeInTheDocument()
    
    rerender(<PasswordStrengthMeter password="StrongP@ssw0rd!" />)
    expect(screen.getByText('Strong')).toBeInTheDocument()
  })

  it('shows appropriate strength colors', () => {
    const { rerender } = render(<PasswordStrengthMeter password="weak" />)
    let strengthText = screen.getByText('Weak')
    expect(strengthText).toHaveClass('text-red-700')
    
    rerender(<PasswordStrengthMeter password="StrongP@ssw0rd!" />)
    strengthText = screen.getByText('Strong')
    expect(strengthText).toHaveClass('text-green-700')
  })

  it('has proper ARIA attributes for accessibility', () => {
    render(<PasswordStrengthMeter password="TestPassword123!" />)
    
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toHaveAttribute('aria-valuenow')
    expect(progressBar).toHaveAttribute('aria-valuemin', '0')
    expect(progressBar).toHaveAttribute('aria-valuemax', '10')
    expect(progressBar).toHaveAttribute('aria-label')
  })

  it('provides feedback messages', () => {
    render(<PasswordStrengthMeter password="weak" />)
    
    // Should have feedback for weak password
    expect(screen.getByText(/Use at least 8 characters/)).toBeInTheDocument()
  })
})
