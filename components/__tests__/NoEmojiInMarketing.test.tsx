import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { Footer } from '../landing/Footer'
import { FinalCTA } from '../landing/FinalCTA'

describe('NoEmojiInMarketing', () => {
  describe('Footer component', () => {
    it('should not contain the ⚛ emoji in rendered content', () => {
      const { container } = render(<Footer />)
      
      const text = container.textContent || ''
      expect(text).not.toContain('⚛')
    })

    it('should render the copyright text without emoji', () => {
      const { container } = render(<Footer />)
      
      const text = container.textContent || ''
      expect(text).toContain('© 2026')
      expect(text).toContain('NUCLEAR')
      expect(text).toContain('All rights reserved')
    })
  })

  describe('FinalCTA component', () => {
    it('should not contain the ⚛ emoji in rendered content', () => {
      const mockOnOpenLogin = vi.fn()
      const { container } = render(<FinalCTA onOpenLogin={mockOnOpenLogin} />)
      
      const text = container.textContent || ''
      expect(text).not.toContain('⚛')
    })

    it('should render marketing text about NUCLEAR', () => {
      const mockOnOpenLogin = vi.fn()
      const { container } = render(<FinalCTA onOpenLogin={mockOnOpenLogin} />)
      
      const text = container.textContent || ''
      expect(text).toContain('NUCLEAR')
      expect(text).toContain('radiopharmaceutical')
    })
  })
})
