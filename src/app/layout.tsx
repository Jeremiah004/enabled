import type { Metadata, Viewport } from 'next';
import { DM_Sans, Instrument_Serif } from 'next/font/google';
import './globals.css';

const fontSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const fontSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Enabled Multi Concept — Staff Portal',
  description:
    'Operational excellence for Enabled Multi Concept — session auditing, payroll governance, and staff administration.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Enabled',
  },
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/icon-192.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#10b981',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fontSans.variable} ${fontSerif.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
