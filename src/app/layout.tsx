import type { Viewport } from 'next'
import { AuthProvider } from '@/context/AuthProvider'
import './globals.css'

export const metadata = {
  applicationName: 'App Chris',
  title: 'App Chris',
  description: 'App Chris',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='es'>
      <head>
        <link rel='icon' href='/favicon.svg' />
        <meta name='apple-mobile-web-app-capable' content='yes' />
        <meta name='apple-mobile-web-app-status-bar-style' content='default' />
        <meta name='apple-mobile-web-app-title' content='App Chris' />
        <meta name='theme-color' content='#0f766e' />
        <link rel='apple-touch-icon' href='/icons/apple-touch-icon.png' />
        <link rel='manifest' href='/manifest.webmanifest' />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
