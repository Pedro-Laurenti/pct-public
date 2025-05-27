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
  applicationName: 'Psicologia Católica Tradicional',
  referrer: 'origin-when-cross-origin',
  keywords: ['psicologia católica', 'psicologia tomista', 'mentoria católica', 'psicologia católica tomista', 'psicologia católica tradicional'],
  authors: [{ name: 'Liliane Lopes', url: 'https://psicologiacatolicatradicional.com.br' }],
  creator: 'Psicologia Católica Tradicional',
  publisher: 'Psicologia Católica Tradicional',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '16x16', type: 'image/x-icon' },
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
      { url: '/favicon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'apple-touch-icon-precomposed',
        url: '/apple-touch-icon.png',
      },
      {
        rel: 'mask-icon',
        url: '/safari-pinned-tab.svg',
        color: '#A30808',
      }
    ],
  },openGraph: {
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
    siteName: 'Psicologia Católica Tradicional',
    url: 'https://psicologiacatolicatradicional.com.br/',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Psicologia Católica Tomista",
    description: "Portal oficial da Psicologia Católica Tomista, onde você encontra recursos sobre a integração da psicologia com os princípios da filosofia tomista.",
    images: ['/images/1.jpg'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {  return (
    <html lang="pt-BR" data-theme="mydark">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#A30808" />
        <link rel="canonical" href="https://psicologiacatolicatradicional.com.br/" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
