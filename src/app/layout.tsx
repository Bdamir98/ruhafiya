import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_Bengali } from "next/font/google";
import "./globals.css";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import PerformanceMonitor from "@/components/PerformanceMonitor";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSansBengali = Noto_Sans_Bengali({
  variable: "--font-noto-bengali",
  subsets: ["bengali", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: {
    default: "Ruhafiya - প্রাকৃতিক ব্যথানাশক তেল | Ruhafiya Pain Relief Oil",
    template: "%s | Ruhafiya"
  },
  description: "Ruhafiya প্রাকৃতিক ব্যথানাশক তেল - জয়েন্ট পেইন, মাসল পেইন, আর্থ্রাইটিসের জন্য কার্যকর সমাধান। ১০০% প্রাকৃতিক উপাদান, পার্শ্বপ্রতিক্রিয়া মুক্ত।",
  keywords: [
    "Ruhafiya", "ব্যথানাশক তেল", "জয়েন্ট পেইন", "আর্থ্রাইটিস", "মাসল পেইন", 
    "প্রাকৃতিক চিকিৎসা", "হার্বাল তেল", "ব্যথার ও���ুধ", "বাংলাদেশ", "pain relief oil"
  ],
  authors: [{ name: "Ruhafiya Healthcare" }],
  creator: "Ruhafiya Healthcare",
  publisher: "Ruhafiya Healthcare",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://ruhafiya.com'),
  alternates: {
    canonical: '/',
    languages: {
      'bn-BD': '/bn',
      'en-US': '/en',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'bn_BD',
    url: '/',
    title: 'Ruhafiya - প্রাকৃতিক ব্যথানাশক তেল',
    description: 'জয়েন্ট পেইন, মাসল পেইন, আর্থ্রাইটিসের জন্য কার্যকর প্রাকৃতিক সমাধান',
    siteName: 'Ruhafiya',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Ruhafiya ব্যথানাশক তেল',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ruhafiya - প্রাকৃতিক ব্যথানাশক তেল',
    description: 'জয়েন্ট পেইন, মাসল পেইন, আর্থ্রাইটিসে�� জন্য কার্যকর প্রাকৃতিক সমাধান',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  ...(process.env.GOOGLE_VERIFICATION_ID || process.env.YANDEX_VERIFICATION_ID || process.env.BING_VERIFICATION_ID ? {
    verification: {
      ...(process.env.GOOGLE_VERIFICATION_ID && { google: process.env.GOOGLE_VERIFICATION_ID }),
      ...(process.env.YANDEX_VERIFICATION_ID && { yandex: process.env.YANDEX_VERIFICATION_ID }),
      ...(process.env.BING_VERIFICATION_ID && {
        other: { 'msvalidate.01': process.env.BING_VERIFICATION_ID }
      })
    }
  } : {}),
  category: 'Health & Wellness',
  classification: 'Natural Health Products',
  other: {
    ...(process.env.FACEBOOK_APP_ID && { 'fb:app_id': process.env.FACEBOOK_APP_ID }),
    'application-name': 'Ruhafiya',
    'msapplication-TileColor': '#10b981',
    'theme-color': '#10b981',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'Ruhafiya',
    'mobile-web-app-capable': 'yes',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${notoSansBengali.variable} antialiased bengali-text`}
      >
        <PerformanceMonitor />
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
