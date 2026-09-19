import type { Metadata } from "next";
import { JetBrains_Mono, Press_Start_2P } from "next/font/google";
import { SITE } from "@/components/Card/format";
import "./globals.css";

const mono = JetBrains_Mono({
  variable: "--font-jb",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const pixel = Press_Start_2P({
  variable: "--font-pixel",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  metadataBase: new URL(`https://${SITE}`), // link previews need absolute image URLs
  title: "postgame",
  description: "Spotify Wrapped for a single coding session.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${mono.variable} ${pixel.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
