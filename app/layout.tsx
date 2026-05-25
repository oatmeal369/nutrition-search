import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "식품 영양성분 검색",
  description: "Supabase 기반 식품 영양성분 DB 검색 사이트",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
