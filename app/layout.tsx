import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Nav from "@/components/nav";
import ScrollToTop from "@/components/scroll-to-top";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "raise(fn) — Fundraising Intelligence for Startups",
  description: "The intelligence layer for startup fundraising — built for founders, VCs, and the agent economy.",
  metadataBase: new URL("https://raisefn.com"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-950 text-zinc-100 min-h-screen`}
      >
        <Nav />
        <ScrollToTop />
        <div className="warm-glow" />
        <div className="teal-glow" />
        {children}
      </body>
    </html>
  );
}
