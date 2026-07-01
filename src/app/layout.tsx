import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import Sidebar from "@/components/layout/Sidebar";
import BottomNav from "@/components/layout/BottomNav";
import Header from "@/components/layout/Header";
import GlobalStreamingModals from "@/components/streaming/GlobalStreamingModals";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Movvo - Movies & TV Streaming Platform",
  description: "Watch your favorite movies and TV shows instantly with real-time API integrations and adaptive streaming players.",
  keywords: ["streaming", "movies", "tv shows", "movvo", "vidsrc", "tmdb"],
  authors: [{ name: "Movvo Inc." }],
  openGraph: {
    title: "Movvo - Movies & TV Streaming Platform",
    description: "Watch your favorite movies and TV shows instantly with real-time API integrations and adaptive streaming players.",
    url: "https://movvo-beta.vercel.app",
    siteName: "Movvo",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Movvo Streaming Platform Preview Banner",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Movvo - Movies & TV Streaming Platform",
    description: "Watch your favorite movies and TV shows instantly with real-time API integrations and adaptive streaming players.",
    images: ["/og-image.png"],
  },
  metadataBase: new URL("https://movvo-beta.vercel.app"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-zinc-950 text-zinc-50 flex flex-row overflow-x-hidden">
        <AppProvider>
          {/* Desktop Sidebar */}
          <Sidebar />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-h-screen relative pb-16 md:pb-0 overflow-x-hidden">
            {/* Glassmorphic Header */}
            <Header />

            {/* Page Viewport */}
            <main className="flex-1 w-full flex flex-col">
              {children}
            </main>
          </div>

          {/* Mobile Bottom Navigation */}
          <BottomNav />

          {/* Global Immersive Modals (Details & Video Player) */}
          <GlobalStreamingModals />
        </AppProvider>
      </body>
    </html>
  );
}
