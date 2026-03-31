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
  title: "AuraIn. — Create Your Professional Resume",
  description:
    "AuraIn. is a resume builder to help you create professional resumes quickly.",
  keywords: ["resume builder", "professional resume", "cv maker"],
  openGraph: {
    title: "AuraIn. — Create Your Professional Resume",
    description:
      "AuraIn. is a resume builder to help you create professional resumes quickly.",
    type: "website",
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
