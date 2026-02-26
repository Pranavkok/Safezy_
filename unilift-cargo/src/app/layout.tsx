import { Inter } from 'next/font/google';
import './globals.css';
import { Metadata } from 'next';
import Providers from '@/components/Providers';
import { UserProvider } from '@/context/UserContext';
import { Toaster } from 'react-hot-toast';
import { Suspense } from 'react';
import Spinner from '@/components/loaders/Spinner';
import BottomTabLayout from '@/sections/bottom-tab/BottomTabLayout';
import Script from 'next/script';

// Import the Inter font from Google Fonts
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'Safezy | Workplace Safety Product Management',
  description:
    'Comprehensive workplace safety management platform. Order, track, and assign safety products to worksites and employees with real-time inventory management.',
  applicationName: 'Safezy',
  keywords: [
    'workplace safety',
    'safety products',
    'worksite management',
    'employee safety',
    'inventory tracking',
    'safety equipment',
    'construction safety',
    'industrial safety',
    'PPE management',
    'worksite inventory'
  ]
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google Ads */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-17516900283"
          strategy="afterInteractive"
        />
        <Script id="google-ads" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-17516900283');
          `}
        </Script>

        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-N1NHMGF4ZX"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-N1NHMGF4ZX');
          `}
        </Script>
      </head>
      <body className={`${inter.className} antialiased`}>
        <UserProvider>
          <Providers>
            <Suspense
              fallback={
                <div className="h-screen w-full flex justify-center items-center">
                  <Spinner />
                </div>
              }
            >
              <BottomTabLayout>{children}</BottomTabLayout>
            </Suspense>
          </Providers>
        </UserProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
