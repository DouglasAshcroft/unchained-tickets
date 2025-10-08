import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { headers } from "next/headers";
import { cookieToInitialState } from "wagmi";
import { RootProvider } from "./rootProvider";
import { Providers } from "./providers";
import { ApiStatus } from "@/components/ApiStatus";
import { getWagmiConfig } from "./wagmi.config";
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get wagmi config
  const config = getWagmiConfig();

  // Extract cookies for SSR state hydration (must await in Next.js 15)
  const headersList = await headers();
  const cookie = headersList.get('cookie');

  // Convert cookie to initial state for hydration
  const initialState = cookieToInitialState(config, cookie);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Resource hints for better performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      </head>
      <body className={`${inter.variable} antialiased font-sans`}>
        <RootProvider initialState={initialState}>
          <Providers>
            {children}
            <ApiStatus />
          </Providers>
        </RootProvider>
      </body>
    </html>
  );
}
