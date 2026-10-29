import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { AppShell } from '../src/components/AppShell';
import { ScrollToTop } from '../src/components/ScrollToTop';

export const metadata: Metadata = {
  title: 'PulseFit Sanctuary — Personal Training & Movement Craft',
  description: 'Mindful training center, customizable routines, interval flow timer, and consistency analytics.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" data-theme="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@300;400;500;600;700;800&family=Newsreader:ital,opsz,wght@0,6..72,400..700;1,6..72,400..700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-app text-token-primary selection:bg-[#74a87c]/30 selection:text-[#9dd3a4] transition-colors duration-200">
        <Providers>
          <ScrollToTop />
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
