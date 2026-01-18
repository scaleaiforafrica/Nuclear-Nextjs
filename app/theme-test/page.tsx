'use client'

import { useTheme } from 'next-themes'
import { Monitor, Sun, Moon } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function ThemeTestPage() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Theme Test Page</h1>
        
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Current Theme State</h2>
          <div className="space-y-2">
            <p><strong>Active Theme:</strong> {theme}</p>
            <p><strong>Resolved Theme:</strong> {resolvedTheme}</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Theme Selector</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => setTheme('light')}
              className={`p-4 rounded-lg border-2 transition-all ${
                theme === 'light'
                  ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <Sun className="w-6 h-6 mx-auto mb-2" />
              <div className="text-sm font-medium">Light</div>
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-lg border-2 transition-all ${
                theme === 'dark'
                  ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <Moon className="w-6 h-6 mx-auto mb-2" />
              <div className="text-sm font-medium">Dark</div>
            </button>
            <button
              onClick={() => setTheme('system')}
              className={`p-4 rounded-lg border-2 transition-all ${
                theme === 'system'
                  ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <Monitor className="w-6 h-6 mx-auto mb-2" />
              <div className="text-sm font-medium">System</div>
            </button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Visual Tests</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Colors</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-primary text-primary-foreground p-4 rounded">Primary</div>
                <div className="bg-secondary text-secondary-foreground p-4 rounded">Secondary</div>
                <div className="bg-accent text-accent-foreground p-4 rounded">Accent</div>
                <div className="bg-muted text-muted-foreground p-4 rounded">Muted</div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Text</h3>
              <p className="text-foreground">This is foreground text</p>
              <p className="text-muted-foreground">This is muted foreground text</p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Inputs & Buttons</h3>
              <input 
                type="text" 
                placeholder="Test input" 
                className="w-full p-2 border border-input bg-input-background rounded mb-2"
              />
              <button className="bg-primary text-primary-foreground px-4 py-2 rounded hover:opacity-90">
                Test Button
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
