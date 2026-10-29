import type { Metadata } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { AppShell } from "@/components/layout/AppShell";
import { brandConfig } from "@/config/brand";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: brandConfig.name,
    template: `%s | ${brandConfig.name}`,
  },
  description: brandConfig.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>
        <AppShell>{children}</AppShell>
        <Analytics />
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3558776123499527"
          async
          crossOrigin="anonymous"
          strategy="beforeInteractive"
        />
      </body>
    </html>
  );
}
