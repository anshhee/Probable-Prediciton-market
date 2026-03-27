import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Web3Providers from "@/providers/Web3Providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Probable",
  description: "Decentralized prediction markets",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <Web3Providers>{children}</Web3Providers>
      </body>
    </html>
  );
}
