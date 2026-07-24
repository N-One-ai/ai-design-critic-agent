import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "AI Design Critic",
  description: "Đánh giá mức độ tuân thủ thương hiệu và chất lượng thiết kế bằng AI",
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
