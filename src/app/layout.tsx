import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Family Calendar - Kitchen Dashboard',
  description: 'A beautiful family calendar app optimized for iPad and kitchen use',
  generator: 'Next.js',
  applicationName: 'Family Calendar',
  referrer: 'origin-when-cross-origin',
  keywords: ['family', 'calendar', 'events', 'reminders', 'iPad', 'kitchen'],
  authors: [{ name: 'Family Calendar App' }],
  creator: 'Family Calendar Team',
  publisher: 'Family Calendar',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://family-calendar-app.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Family Calendar - Kitchen Dashboard',
    description: 'Stay organized with our beautiful family calendar designed for always-on iPad use',
    url: 'https://family-calendar-app.vercel.app',
    siteName: 'Family Calendar',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/d90c7fd2-b4d6-4a9c-98fc-4a2ab1958e9e.png',
        width: 1200,
        height: 630,
        alt: 'Family Calendar App - Beautiful dashboard interface with colorful event cards',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Family Calendar - Kitchen Dashboard',
    description: 'Stay organized with our beautiful family calendar designed for always-on iPad use',
    images: ['https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/6d42f0e5-2412-45fc-afb4-dc0b65041efc.png'],
  },
  appleWebApp: {
    title: 'Family Calendar',
    statusBarStyle: 'default',
    capable: true,
  },
  verification: {
    google: 'verification-code', // Add your actual verification codes
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1a1a' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <head>
        {/* Optimize for iPad and touch devices */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Family Calendar" />
        
        {/* Mobile-friendly viewport */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover" />
        
        {/* Preload critical fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* PWA icons */}
        <link rel="icon" type="image/png" sizes="32x32" href="/icon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#3b82f6" />
        
        {/* Windows tile */}
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
        {/* Optimize for touch */}
        <meta name="format-detection" content="telephone=no, address=no, email=no" />
        
        {/* Prevent text size adjust on orientation change */}
        <meta name="text-size-adjust" content="100%" />
        
        {/* Schema.org markup for search engines */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'Family Calendar',
              description: 'A beautiful family calendar app optimized for iPad and kitchen use',
              applicationCategory: 'LifestyleApplication',
              operatingSystem: 'Web Browser',
              browserRequirements: 'Requires JavaScript. Requires HTML5.',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
            }),
          }}
        />
      </head>
      <body 
        className={`
          ${inter.className} 
          h-full 
          bg-gradient-to-br from-slate-50 to-blue-50
          dark:from-gray-900 dark:to-gray-800
          font-sans 
          antialiased 
          touch-manipulation
          overflow-x-hidden
        `}
        style={{
          // Prevent pull-to-refresh on mobile
          overscrollBehavior: 'none',
          // Improve touch responsiveness
          touchAction: 'manipulation',
          // Prevent text selection for better touch experience
          WebkitUserSelect: 'none',
          WebkitTouchCallout: 'none',
          // Optimize for iPad and iPhone
          WebkitTextSizeAdjust: '100%',
          // Remove tap highlights
          WebkitTapHighlightColor: 'transparent',
          // Improve scrolling performance on mobile
          WebkitOverflowScrolling: 'touch',
          // Prevent zoom on input focus (iOS)
          fontSize: '16px',
        }}
      >
        <div 
          id="app-root" 
          className="
            min-h-full 
            w-full 
            overflow-x-hidden 
            relative
            touch-manipulation
          "
        >
          {children}
        </div>
        
        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(registration) {
                    console.log('SW registered: ', registration);
                  }).catch(function(registrationError) {
                    console.log('SW registration failed: ', registrationError);
                  });
                });
              }
            `,
          }}
        />
        
        {/* Notification permission prompt helper */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Helper function to handle notification permission
              window.requestNotificationPermission = async function() {
                if ('Notification' in window && Notification.permission === 'default') {
                  const permission = await Notification.requestPermission();
                  return permission === 'granted';
                }
                return Notification.permission === 'granted';
              };
              
              // Prevent zoom on double tap for better iPad experience
              let lastTouchEnd = 0;
              document.addEventListener('touchend', function (event) {
                const now = (new Date()).getTime();
                if (now - lastTouchEnd <= 300) {
                  event.preventDefault();
                }
                lastTouchEnd = now;
              }, false);
              
              // Optimize for iPad orientation changes
              window.addEventListener('orientationchange', function() {
                setTimeout(function() {
                  window.scrollTo(0, 0);
                }, 100);
              });
            `,
          }}
        />
      </body>
    </html>
  )
}