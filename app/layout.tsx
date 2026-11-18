import type { Metadata } from "next";
import { Bricolage_Grotesque, DM_Sans } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dmsans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "made4togethr — Find a Buddy, Not a Date | Hire Verified Local Companions",
    template: "%s | made4togethr",
  },
  description:
    "Looking for a gym partner, movie buddy, or coffee companion? Connect with ID-verified local buddies across India. 100% platonic, escrow-safe, public places only. Zero awkwardness.",
  keywords: [
    "made4togethr",
    "hire companion india",
    "find a buddy not a date",
    "platonic companion india",
    "gym partner delhi",
    "movie buddy bangalore",
    "city guide mumbai",
    "shopping buddy pune",
    "safe social meetups india",
    "rent a friend india",
  ],
  authors: [{ name: "made4togethr Labs" }],
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "made4togethr — Find a Buddy, Not a Date",
    description:
      "Verified local companions for the things that are better together — gym, movies, cafes, and city walks. 100% platonic, 18+, safety-first.",
    url: "https://made4togethr.in",
    siteName: "made4togethr",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "made4togethr — Find a Buddy, Not a Date",
    description:
      "Hire ID-verified local buddies for gym, movies, coffee chats, and city walks across India.",
  },
};

import { ToastProvider } from "@/components/ui/toast";
import { AuthProvider } from "@/context/auth-context";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink font-body selection:bg-lime selection:text-ink">
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
