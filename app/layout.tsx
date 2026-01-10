import type { Metadata, Viewport } from 'next'
import '../styles/globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: '⚛ NUCLEAR - Nuclear Supply Chain Management',
  description: 'Comprehensive nuclear supply chain management platform for radiopharmaceutical delivery',
  keywords: ['nuclear medicine', 'logistics', 'radiopharmaceutical', 'supply chain', 'compliance'],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 3,
  userScalable: true,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
