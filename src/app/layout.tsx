import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Press_Start_2P, Silkscreen } from "next/font/google";
import { ThemeProvider } from "@/context/ThemeContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const pressStart2P = Press_Start_2P({
  variable: "--font-press-start",
  weight: "400",
  subsets: ["latin"],
});

const silkscreen = Silkscreen({
  variable: "--font-silkscreen",
  weight: ["400", "700"],
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0f0326" },
    { media: "(prefers-color-scheme: light)", color: "#fef7f0" },
  ],
};

export const metadata: Metadata = {
  title: {
    default: "Ahana's World — Songs, Sketches, Stories & Stars",
    template: "%s | Ahana's World",
  },
  description:
    "A young creative explorer's world where songs, sketches, stories, and stars meet. Safe, parent-managed, and fueled by imagination.",
  keywords: ["kids creative", "young artist", "children songs", "kid art", "parent managed", "creative portfolio"],
  authors: [{ name: "Ahana's World" }],
  openGraph: {
    type: "website",
    siteName: "Ahana's World",
    title: "Ahana's World — Songs, Sketches, Stories & Stars",
    description: "A young creative explorer's world where songs, sketches, stories, and stars meet.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ahana's World — Songs, Sketches, Stories & Stars",
    description: "A young creative explorer's world where songs, sketches, stories, and stars meet.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${pressStart2P.variable} ${silkscreen.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
