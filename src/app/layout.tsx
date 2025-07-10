import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
})

export const metadata: Metadata = {
  title: '体組成記録アプリ',
  description: '体重、BMI、体脂肪率などの体組成データを記録・管理するアプリケーション',
  keywords: ['体組成', '体重管理', 'BMI', '健康管理', 'フィットネス'],
  authors: [{ name: 'Body Composition Tracker' }],
  creator: 'Body Composition Tracker',
  publisher: 'Body Composition Tracker',
  robots: 'index, follow',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  themeColor: '#3b82f6',
  colorScheme: 'light',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    title: '体組成記録アプリ',
    description: '体重、BMI、体脂肪率などの体組成データを記録・管理するアプリケーション',
    siteName: '体組成記録アプリ',
  },
  twitter: {
    card: 'summary_large_image',
    title: '体組成記録アプリ',
    description: '体重、BMI、体脂肪率などの体組成データを記録・管理するアプリケーション',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" className={inter.className}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}', {
                    page_path: window.location.pathname,
                    anonymize_ip: true,
                  });
                `,
              }}
            />
          </>
        )}
      </head>
      <body>
        <main role="main">
          {children}
        </main>
      </body>
    </html>
  )
}
