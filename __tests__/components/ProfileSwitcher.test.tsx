import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProfileSwitcher } from '@/components/profile/ProfileSwitcher'
import type { UserRole } from '@/models'

describe('ProfileSwitcher', () => {
  const mockProfiles = [
    {
      name: 'Test User',
      role: 'Hospital Administrator' as UserRole,
      initials: 'TU'
    },
    {
      name: 'Test User',
      role: 'Logistics Manager' as UserRole,
      initials: 'TU'
    },
    {
      name: 'Test User',
      role: 'Compliance Officer' as UserRole,
      initials: 'TU'
    }
  ]

  const mockCurrentProfile = mockProfiles[0]

  it('should render current profile information', () => {
    const onProfileSwitch = vi.fn()
    
    render(
      <ProfileSwitcher
        currentProfile={mockCurrentProfile}
        availableProfiles={mockProfiles}
        onProfileSwitch={onProfileSwitch}
        collapsed={false}
      />
    )

    expect(screen.getByText('Test User')).toBeInTheDocument()
    expect(screen.getByText('Hospital Administrator')).toBeInTheDocument()
    expect(screen.getByText('TU')).toBeInTheDocument()
  })

  it('should render trigger button with correct aria attributes', () => {
    const onProfileSwitch = vi.fn()
    
    render(
      <ProfileSwitcher
        currentProfile={mockCurrentProfile}
        availableProfiles={mockProfiles}
        onProfileSwitch={onProfileSwitch}
        collapsed={false}
      />
    )

    const button = screen.getByRole('button', { name: /switch profile/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('aria-label', 'Switch profile')
  })

  it('should render collapsed view correctly', () => {
    const onProfileSwitch = vi.fn()
    
    render(
      <ProfileSwitcher
        currentProfile={mockCurrentProfile}
        availableProfiles={mockProfiles}
        onProfileSwitch={onProfileSwitch}
        collapsed={true}
      />
    )

    // Should only show initials in collapsed mode
    expect(screen.getByText('TU')).toBeInTheDocument()
    expect(screen.queryByText('Test User')).not.toBeInTheDocument()
  })

  it('should have chevron down icon in expanded mode', () => {
    const onProfileSwitch = vi.fn()
    
    const { container } = render(
      <ProfileSwitcher
        currentProfile={mockCurrentProfile}
        availableProfiles={mockProfiles}
        onProfileSwitch={onProfileSwitch}
        collapsed={false}
      />
    )

    // Check for the SVG icon
    const svgIcon = container.querySelector('svg')
    expect(svgIcon).toBeInTheDocument()
  })

  it('should render as button with correct classes', () => {
    const onProfileSwitch = vi.fn()
    
    render(
      <ProfileSwitcher
        currentProfile={mockCurrentProfile}
        availableProfiles={mockProfiles}
        onProfileSwitch={onProfileSwitch}
        collapsed={false}
      />
    )

    const button = screen.getByRole('button', { name: /switch profile/i })
    expect(button).toHaveClass('w-full', 'flex', 'items-center')
  })
})
