// Created: 2025-01-28
// v2.1 - Load JetBrains Mono via next/font/google instead of CSS @import
// Purpose: Root layout for ChronoLog. Wraps the entire app with AuthProvider and
//          ThemeProvider. Sets default dark theme via data-theme attribute.

import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../contexts/AuthContext";
import { ThemeProvider } from "../contexts/ThemeContext";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ChronoLog",
  description: "Terminal-style time tracking for consultants",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
      className={jetbrainsMono.variable}
    >
      <body>
        <AuthProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
