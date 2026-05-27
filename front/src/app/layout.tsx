import type { Metadata } from "next";
import { Providers } from "@/shared/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "SellerRoom",
  description: "1인 셀러를 위한 상품, 재고, 주문 관리 도구"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
