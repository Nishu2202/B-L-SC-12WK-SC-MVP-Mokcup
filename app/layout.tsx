import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "B+L Agent-Led Supply Chain Planning",
  description:
    "AI-enabled planning, autonomous execution support, and decision intelligence for Bausch + Lomb.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} bg-[var(--color-background)]`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
