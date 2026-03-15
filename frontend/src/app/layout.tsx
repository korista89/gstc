import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GSTC - 경은학교 교사교육과정",
  description: "과목별 월별 성취기준 배정 및 평가 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="bg-slate-50 text-slate-900 min-h-screen">
        {children}
      </body>
    </html>
  );
}
