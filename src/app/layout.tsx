import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Cormorant_Garamond } from "next/font/google"; // Fonte serif elegante para títulos no estilo clássico
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Psicologia Católica Tomista",
  description: "Portal oficial da Psicologia Católica Tomista, onde você encontra recursos sobre a integração da psicologia com os princípios da filosofia tomista.",
  metadataBase: new URL('https://psicologiacatolicatradicional.com.br/'),
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
    other: {
      rel: 'apple-touch-icon-precomposed',
      url: '/favicon.ico',
    },
  },
  openGraph: {
    title: "Psicologia Católica Tomista",
    description: "Portal oficial da Psicologia Católica Tomista, onde você encontra recursos sobre a integração da psicologia com os princípios da filosofia tomista.",
    images: [
      {
        url: '/images/1.jpg',
        width: 800,
        height: 600,
        alt: 'Psicologia Católica Tomista',
      }
    ],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Psicologia Católica Tomista",
    description: "Portal oficial da Psicologia Católica Tomista",
    images: ['/images/1.jpg'],
  },
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
