// app/layout.tsx
import type { Metadata } from 'next';
import { type ReactNode } from 'react';
import './globals.css';
import { GameProvider } from '@/providers/GameProvider';
import PageTransition from '@/components/PageTransition';
import AppShell from '@/components/AppShell';
import AppBackground from '@/components/AppBackground';
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.boredteacher.online'),
  title: {
    default: 'Bored Teacher Online | ESL Learning Games for Classrooms',
    template: '%s | Bored Teacher Online',
  },
  description: 'Bored Teacher Online is a game-based ESL learning platform with classroom games, progress tracking, and teacher resources.',
  applicationName: 'Bored Teacher Online',
  authors: [{ name: 'Bored Teacher Online' }],
  creator: 'Bored Teacher Online',
  publisher: 'Bored Teacher Online',
  alternates: { canonical: '/' },
  keywords: [
    'Bored Teacher Online',
    'ESL learning games',
    'English classroom games',
    'educational games for students',
    'teacher resources',
  ],
  openGraph: {
    type: 'website',
    url: 'https://www.boredteacher.online',
    siteName: 'Bored Teacher Online',
    title: 'Bored Teacher Online | ESL Learning Games for Classrooms',
    description: 'Game-based ESL learning, classroom practice, progress tracking, and teacher resources from Bored Teacher Online.',
    images: [{ url: '/assets/.optimized/logo.webp', alt: 'Bored Teacher Online logo' }],
  },
  twitter: {
    card: 'summary',
    title: 'Bored Teacher Online | ESL Learning Games for Classrooms',
    description: 'Game-based ESL learning, classroom practice, and teacher resources.',
    images: ['/assets/.optimized/logo.webp'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" as="image" href="/assets/images/plain-bg.png" fetchPriority="high" />
      </head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'EducationalOrganization',
              name: 'Bored Teacher Online',
              alternateName: 'Bored Teacher Online ESL Game Hub',
              url: 'https://www.boredteacher.online',
              logo: 'https://www.boredteacher.online/assets/.optimized/logo.webp',
              description: 'A game-based ESL learning platform with classroom games, progress tracking, and teacher resources.',
            }),
          }}
        />
        <ServiceWorkerRegistration />
        <GameProvider>
          <AppBackground />
          <AppShell>
            <PageTransition>
              {children}
            </PageTransition>
          </AppShell>
        </GameProvider>
      </body>
    </html>
  );
}
