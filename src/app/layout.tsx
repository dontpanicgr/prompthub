import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth-provider";
import { Toaster } from "@/components/ui/sonner";
import ErrorBoundary from "@/components/ui/error-boundary";
import { Analytics } from '@vercel/analytics/next';
import { AnalyticsProvider, GoogleAnalytics, MixpanelAnalytics } from '@/components/analytics-provider';
import { Suspense } from 'react';
import '@/lib/analytics' // Import analytics to enable tracking

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: {
    default: "PromptHub - AI Prompt Sharing Community",
    template: "%s | PromptHub"
  },
  description: "Discover, share, and collaborate on AI prompts with the PromptHub community. Find the perfect prompts for your AI projects.",
  keywords: ["AI", "prompts", "artificial intelligence", "machine learning", "prompt engineering", "chatgpt", "claude", "ai tools"],
  authors: [{ name: "PromptHub Team" }],
  creator: "PromptHub",
  publisher: "PromptHub",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://prompthub.com",
    title: "PromptHub - AI Prompt Sharing Community",
    description: "Discover, share, and collaborate on AI prompts with the PromptHub community.",
    siteName: "PromptHub",
  },
  twitter: {
    card: "summary_large_image",
    title: "PromptHub - AI Prompt Sharing Community",
    description: "Discover, share, and collaborate on AI prompts with the PromptHub community.",
    creator: "@prompthub",
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
    google: "your-google-site-verification-code",
  },
  other: {
    // Add your analytics tracking IDs here
    'google-analytics': process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID,
    'mixpanel': process.env.NEXT_PUBLIC_MIXPANEL_TOKEN,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes, viewport-fit=cover" />
        <meta name="theme-color" content="#f8f8f9" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#0d0d0f" media="(prefers-color-scheme: dark)" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="PromptHub" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#f8f8f9" />
        <meta name="msapplication-tap-highlight" content="no" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('prompthub-theme') || 'system';
                if (theme === 'system') {
                  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  document.documentElement.classList.add(systemTheme);
                  document.documentElement.setAttribute('data-theme', systemTheme);
                } else {
                  document.documentElement.classList.add(theme);
                  document.documentElement.setAttribute('data-theme', theme);
                }
              } catch (e) {
                // Fallback to light theme if localStorage is not available
                document.documentElement.classList.add('light');
                document.documentElement.setAttribute('data-theme', 'light');
              }
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased touch-manipulation`}
      >
        <ThemeProvider
          defaultTheme="system"
          storageKey="prompthub-theme"
        >
          <ErrorBoundary>
            <AuthProvider>
              <Suspense fallback={<div />}>
                <AnalyticsProvider>
                  {children}
                </AnalyticsProvider>
              </Suspense>
            </AuthProvider>
          </ErrorBoundary>
          <Toaster />
        </ThemeProvider>
        <GoogleAnalytics />
        <MixpanelAnalytics />
        <Analytics />
      </body>
    </html>
  );
}
