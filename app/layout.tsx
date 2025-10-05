import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { RootProvider } from "./rootProvider";
import { Providers } from "./providers";
import { ApiStatus } from "@/components/ApiStatus";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Unchained Tickets - Decentralized Event Ticketing",
  description:
    "Buy and sell event tickets as NFTs on the blockchain. Secure, transparent, and censorship-resistant ticketing powered by Base.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Resource hints for better performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      </head>
      <body className={`${inter.variable} antialiased font-sans`}>
        <RootProvider>
          <Providers>
            {children}
            <ApiStatus />
          </Providers>
        </RootProvider>
      </body>
    </html>
  );
}
