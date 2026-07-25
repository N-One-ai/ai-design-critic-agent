import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "ZaloPay AI Creative Platform",
  description: "AI-powered creative workspace for ZaloPay brand compliance and design generation",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
        <Script
          src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
