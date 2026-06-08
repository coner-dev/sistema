import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DAX - Servicios Digitales",
  description: "Tu plataforma de trámites digitales. Actas, RFC, SAT, IMSS, Infonavit y más.",
  keywords: ["DAX", "trámites digitales", "actas", "RFC", "SAT", "IMSS", "Infonavit"],
  authors: [{ name: "DAX Servicios Digitales" }],
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-950 text-white`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
