import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import CursorGlow from "./components/CursorGlow";
import CinematicLoader from "./components/CinematicLoader";
import { AuthProvider } from "./context/AuthContext";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://aurain.me"),
  title: {
    default: "AuraIn | Best AI Resume Builder & ATS-Friendly CV Maker",
    template: "%s | AuraIn Resume Builder",
  },
  description:
    "Build an ATS-optimized resume in minutes with AuraIn's free AI Resume Maker. Overcome writer's block, use premium templates, and land your dream job faster.",
  keywords: [
    "best AI resume builder",
    "free resume maker",
    "ATS-friendly CV creator",
    "AI resume maker free",
    "resume templates",
    "build resume online",
    "professional resume builder",
    "AuraIn",
  ],
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/icon-192.png",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "AuraIn | Best AI Resume Builder & ATS-Friendly CV Maker",
    description:
      "Build an ATS-optimized resume in minutes with AuraIn's free AI Resume Maker. Use premium templates and AI-powered enhancements to land your dream job.",
    type: "website",
    url: "https://aurain.me",
    siteName: "AuraIn",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AuraIn Resume Builder Interactive Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AuraIn | Best AI Resume Builder",
    description: "Build a professional, ATS-optimized resume in minutes with AuraIn's AI Resume Maker.",
    images: ["/og-image.png"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#0e0e0f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} h-full`}
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#a1fd60" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="AuraIn" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="msvalidate.01" content="7735D71B7E2301BAB9098DF147103D9C" />
      </head>
      <body className="min-h-full flex flex-col" style={{ background: "#0e0e0f", overflowX: "hidden" }} suppressHydrationWarning>
        <AuthProvider>
          <CinematicLoader />
          <CursorGlow />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
