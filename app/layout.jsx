import './globals.css';
import AppShell from '../components/AppShell';
import PWAInstaller from '../components/PWAInstaller';

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#4338ca' },
    { media: '(prefers-color-scheme: dark)', color: '#090d16' },
  ],
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export const metadata = {
  title: '日本語マスター · Nihongo Master (Aprende Japonés)',
  description: 'Plataforma interactiva para aprender japonés general basada en materiales de estudio, historias con furigana, práctica con teclado IME, partículas, kanjis y reproductor de voz con controles avanzados.',
  applicationName: 'Nihongo Master',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Nihongo',
  },
  formatDetection: {
    telephone: false,
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
      { url: '/icons/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Noto+Sans+JP:wght@400;500;700;900&display=swap" rel="stylesheet" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Nihongo" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
      </head>
      <body>
        <AppShell>
          {children}
        </AppShell>
        <PWAInstaller />
      </body>
    </html>
  );
}
