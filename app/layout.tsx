import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { RootProvider } from "./rootProvider";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
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
    <html lang="en" className="dark" style={{ colorScheme: 'dark' }}>
      <body className={`${inter.variable} antialiased bg-zinc-950 text-white`}>
        <RootProvider>
          <Providers>
            {children}
          </Providers>
        </RootProvider>
      </body>
    </html>
  );
}
