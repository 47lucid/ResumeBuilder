import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import CursorGlow from "./components/CursorGlow";
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
    "Build a professional, ATS-optimized resume in minutes with AuraIn's AI Resume Maker. Overcome writer's block using our groq-powered AI enhancer, customize premium interactive templates, and land your dream job faster. Try our free resume builder today.",
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
  openGraph: {
    title: "AuraIn | Best AI Resume Builder & ATS-Friendly CV Maker",
    description:
      "Build a professional, ATS-optimized resume in minutes with AuraIn's AI Resume Maker. Overcome writer's block using our groq-powered AI enhancer and customize premium interactive templates.",
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
      <body className="min-h-full flex flex-col" style={{ background: "#0e0e0f" }} suppressHydrationWarning>
        <AuthProvider>
          <CursorGlow />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
