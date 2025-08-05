import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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

export const metadata: Metadata = {
  title: {
    default: "রুহাফিয়া - প্রাকৃতিক ব্যথানাশক তেল | Ruhafiya Pain Relief Oil",
    template: "%s | রুহাফিয়া"
  },
  description: "রুহাফিয়া প্রাকৃতিক ব্যথানাশক তেল - জয়েন্ট পেইন, মাসল পেইন, আর্থ্রাইটিসের জন্য কার্যকর সমাধান। ১০০% প্রাকৃতিক উপাদান, পার্শ্বপ্রতিক্রিয়া মুক্ত।",
  keywords: [
    "রুহাফিয়া", "ব্যথানাশক তেল", "জয়েন্ট পেইন", "আর্থ্রাইটিস", "মাসল পেইন", 
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
    title: 'রুহাফিয়া - প্রাকৃতিক ব্যথানাশক তেল',
    description: 'জয়েন্ট পেইন, মাসল পেইন, আর্থ্রাইটিসের জন্য কার্যকর প্রাকৃতিক সমাধান',
    siteName: 'Ruhafiya',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'রুহাফিয়া ব্যথানাশক তেল',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'রুহাফিয়া - প্রাকৃতিক ব্যথানাশক তেল',
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
  verification: {
    google: process.env.GOOGLE_VERIFICATION_ID,
    yandex: process.env.YANDEX_VERIFICATION_ID,
    other: {
      'msvalidate.01': process.env.BING_VERIFICATION_ID,
    }
  },
  category: 'Health & Wellness',
  classification: 'Natural Health Products',
  other: {
    'fb:app_id': process.env.FACEBOOK_APP_ID,
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <PerformanceMonitor />
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
