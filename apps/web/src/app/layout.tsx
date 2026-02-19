import type { Metadata } from "next";

import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";

import "../index.css";
import Providers from "@/components/providers";
import { getToken } from "@/lib/auth-server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "geoveda",
  description: "geoveda",
  other: process.env.NEXT_PUBLIC_BASE_APP_ID
    ? {
        "base:app_id": process.env.NEXT_PUBLIC_BASE_APP_ID,
      }
    : undefined,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const token = await getToken();
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} antialiased`}
      >
        <Providers initialToken={token}>
          <div className="grid h-svh grid-rows-[auto_1fr]">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
