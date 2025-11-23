import type { Metadata } from "next";
import { Georama } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/common/navbar";

const _georama = Georama({
  subsets: ["latin"],
  variable: "--font-georama",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
})

export const metadata: Metadata = {
  title: "Cautious | Full Stack Developer & UI/UX Enthusiast",
  icons: {
    icon: "/favicon.ico",
  },
  description:
    "189 charactersFull Stack Developer based in South Africa specializing in building accessible, pixel-perfect web and mobile applications. Expert in React, Next.js, TypeScript, and modern web technologies.",
  keywords: [
    "Full Stack Developer",
    "Web Developer",
    "Mobile App Developer",
    "React Developer",
    "Next.js Developer",
    "TypeScript",
    "JavaScript",
    "Frontend Developer",
    "Backend Developer",
    "UI/UX Developer",
    "South Africa Developer",
    "Portfolio",
    "Cautious Developer",
  ],
  authors: [{ name: "Cautious Ndlovu", url: "https://cautiousndlovu.com" }],
  creator: "Cautious Ndlovu",
  openGraph: {
    title: "Cautious Ndlovu",
    description:
      "Full Stack Developer based in South Africa specializing in building accessible, pixel-perfect web and mobile applications. Expert in React, Next.js, TypeScript, and modern web technologies.",
    url: "https://cautiousndlovu.com",
    siteName: "Cautious Ndlovu",
    images: [
      {
        url: "https://cautiousndlovu.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Cautious Ndlovu",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  alternates: {
    canonical: "https://cautiousndlovu.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
       className={`${_georama.variable} font-sans antialiased`}
      >
        <div className="flex flex-col">
          <Navbar />
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
