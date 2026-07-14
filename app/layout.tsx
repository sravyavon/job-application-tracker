import { Analytics } from '@vercel/analytics/next'
import { GoogleAnalytics } from '@next/third-parties/google'
import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans, Fraunces, Geist_Mono } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

const jakarta = Plus_Jakarta_Sans({
  variable: '--font-jakarta',
  subsets: ['latin'],
  display: 'swap',
})

const fraunces = Fraunces({
  variable: '--font-fraunces',
  subsets: ['latin'],
  display: 'swap',
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const siteUrl = 'https://herontrack.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Herontrack — Calm Job Application Tracker',
    template: '%s · Herontrack',
  },
  description:
    'Herontrack is a calm, private link tracker for job seekers. Paste a job posting URL and it pulls the role, company, and portal automatically — then track every application from Applied to Offer in one soothing dashboard.',
  keywords: [
    'job application tracker',
    'job search organizer',
    'application status tracker',
    'LinkedIn Indeed Glassdoor tracker',
    'job hunt dashboard',
    'link tracker',
  ],
  authors: [{ name: 'Herontrack' }],
  creator: 'Herontrack',
  generator: 'v0.app',
  openGraph: {
    type: 'website',
    url: siteUrl,
    title: 'Herontrack — Calm Job Application Tracker',
    description:
      'Paste a job URL, get the role and company auto-filled, and track every application from Applied to Offer. A calm home for a stressful search.',
    siteName: 'Herontrack',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Herontrack — Track every job application without the stress',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Herontrack — Calm Job Application Tracker',
    description:
      'Paste a job URL, get the role and company auto-filled, and track every application from Applied to Offer.',
    images: ['/og-image.png'],
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f4f7f3' },
    { media: '(prefers-color-scheme: dark)', color: '#1a2422' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${jakarta.variable} ${fraunces.variable} ${geistMono.variable} bg-background`}
    >
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
        {process.env.NODE_ENV === 'production' && (
          <GoogleAnalytics gaId="G-0TBR8HP10E" />
        )}
      </body>
    </html>
  )
}
