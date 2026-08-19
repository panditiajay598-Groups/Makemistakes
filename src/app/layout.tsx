import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "MakeMistakes — Proving You Can Build Systems",
  description: "Ditch the tutorial hell. Build real startup system specs, survive simulated traffic spikes, and get hired through verifiable Proof of Work.",
  icons: {
    icon: "/favicon.ico",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#FAF9F5] text-zinc-900 selection:bg-teal-500/20 selection:text-teal-900">
        {children}
      </body>
    </html>
  );
}
