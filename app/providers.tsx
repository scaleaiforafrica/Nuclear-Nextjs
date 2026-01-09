'use client'

import { AuthProvider } from '@/contexts'
import { Toaster } from '@/components/ui/sonner'

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      {children}
      <Toaster />
    </AuthProvider>
  )
}
