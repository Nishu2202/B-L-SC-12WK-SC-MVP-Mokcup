import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "B+L Agent-Led Supply Chain Planning",
  description:
    "AI-enabled planning, autonomous execution support, and decision intelligence for Bausch + Lomb.",
  keywords: ["supply chain", "demand planning", "AI", "Bausch + Lomb"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} h-full bg-[#f8fafc] antialiased`}
    >
      <body className="h-full">{children}</body>
    </html>
  );
}
