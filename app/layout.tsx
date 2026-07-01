import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import ScrollToTop from "@/components/scroll-to-top";
import AuthRedirect from "@/components/auth-redirect";
import { PostHogProvider } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "raise(fn) — The fundraising agent for founders",
  description: "The AI fundraising agent for founders. Runs the raise alongside you.",
  metadataBase: new URL("https://www.raisefn.com"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-950 text-zinc-100 min-h-screen overflow-x-hidden`}
      >
        <PostHogProvider>
          <Nav />
          <ScrollToTop />
          <AuthRedirect />
          <div className="warm-glow" />
          <div className="teal-glow" />
          {children}
          <Footer />
        </PostHogProvider>
      </body>
    </html>
  );
}
