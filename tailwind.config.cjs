/**
 * Renova Brand Tailwind Config Extension
 * Extends Tailwind CSS colors and font families to match brand tokens
 * 
 * Note: This file provides CommonJS format for compatibility.
 * The main tailwind.config.ts will remain the source of truth.
 * To apply these extensions, merge this configuration into tailwind.config.ts.
 */

module.exports = {
  theme: {
    extend: {
      colors: {
        // Renova Brand Colors
        'brand-navy': '#153057',
        'brand-gold': '#c69c6d',
        'brand-muted': '#bec1c4',
        'brand-white': '#ffffff',
        
        // Semantic mappings (these integrate with existing CSS variables)
        'renova': {
          navy: '#153057',
          gold: '#c69c6d',
          muted: '#bec1c4',
          white: '#ffffff',
        },
      },
      fontFamily: {
        // Heading font - Playfair Display
        heading: [
          'Playfair Display',
          'Georgia',
          'Times New Roman',
          'serif',
        ],
        // Body font - Roboto
        body: [
          'Roboto',
          'Inter',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
    },
  },
};
