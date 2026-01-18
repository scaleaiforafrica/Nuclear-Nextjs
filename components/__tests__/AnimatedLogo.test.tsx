import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AnimatedLogo } from '../AnimatedLogo'

describe('AnimatedLogo', () => {
  describe('with showIcon=true', () => {
    it('should render an img element with nuclear-logo.svg', () => {
      render(<AnimatedLogo showIcon={true} />)
      
      const img = screen.getByRole('img')
      expect(img).toBeInTheDocument()
      expect(img).toHaveAttribute('src', '/images/nuclear-logo.svg')
      expect(img).toHaveAttribute('alt', 'Nuclear logo')
    })

    it('should render the NUCLEAR text', () => {
      render(<AnimatedLogo showIcon={true} />)
      
      expect(screen.getByLabelText('NUCLEAR')).toBeInTheDocument()
    })
  })

  describe('with showIcon=false', () => {
    it('should not render an img element', () => {
      render(<AnimatedLogo showIcon={false} />)
      
      const img = screen.queryByRole('img')
      expect(img).not.toBeInTheDocument()
    })

    it('should still render the NUCLEAR text', () => {
      render(<AnimatedLogo showIcon={false} />)
      
      expect(screen.getByLabelText('NUCLEAR')).toBeInTheDocument()
    })
  })

  describe('with showText=false', () => {
    it('should not render the NUCLEAR text', () => {
      render(<AnimatedLogo showText={false} showIcon={true} />)
      
      const text = screen.queryByLabelText('NUCLEAR')
      expect(text).not.toBeInTheDocument()
    })

    it('should still render the icon when showText=false', () => {
      render(<AnimatedLogo showText={false} showIcon={true} />)
      
      const img = screen.getByRole('img')
      expect(img).toBeInTheDocument()
      expect(img).toHaveAttribute('src', '/images/nuclear-logo.svg')
    })
  })

  describe('with showText=true', () => {
    it('should render the NUCLEAR text', () => {
      render(<AnimatedLogo showText={true} showIcon={true} />)
      
      expect(screen.getByLabelText('NUCLEAR')).toBeInTheDocument()
    })
  })

  describe('size variants', () => {
    it('should apply small size classes', () => {
      const { container } = render(<AnimatedLogo size="sm" showIcon={true} />)
      
      const img = screen.getByRole('img')
      expect(img).toHaveClass('w-5', 'h-5')
    })

    it('should apply medium size classes', () => {
      const { container } = render(<AnimatedLogo size="md" showIcon={true} />)
      
      const img = screen.getByRole('img')
      expect(img).toHaveClass('w-6', 'h-6')
    })

    it('should apply large size classes', () => {
      const { container } = render(<AnimatedLogo size="lg" showIcon={true} />)
      
      const img = screen.getByRole('img')
      expect(img).toHaveClass('w-8', 'h-8')
    })
  })
})
