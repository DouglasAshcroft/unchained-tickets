import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { headers } from "next/headers";
import { cookieToInitialState } from "wagmi";
import { RootProvider } from "./rootProvider";
import { Providers } from "./providers";
import { ApiStatus } from "@/components/ApiStatus";
import { getWagmiConfig } from "./wagmi.config";
import { Toaster } from "sonner";
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
      <head></head>
      <body className={`${inter.variable} antialiased font-sans`}>
        <RootProvider initialState={initialState}>
          <Providers>
            {children}
            <ApiStatus />
            <Toaster position="top-right" theme="dark" richColors />
          </Providers>
        </RootProvider>
      </body>
    </html>
  );
}
