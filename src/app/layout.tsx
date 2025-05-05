import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Cormorant } from "next/font/google"; // Fonte serif elegante para títulos no estilo grego
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cormorant = Cormorant({
  variable: "--font-cormorant",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Psicologia Católica Tomista",
  description: "Portal oficial da Psicologia Católica Tomista, onde você encontra recursos sobre a integração da psicologia com os princípios da filosofia tomista.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" data-theme="mydark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
