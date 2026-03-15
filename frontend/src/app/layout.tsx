import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "특수학교 교사교육과정 관리 (GSTC)",
    template: "%s | 경은GSTC",
  },
  description: "과목별 월별 성취기준 배정 및 평가 플랫폼",
  keywords: ["GSTC", "교사교육과정", "특수교육", "개별화교육", "성취기준"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        {children}
        <footer style={{ textAlign: "center", padding: "20px", backgroundColor: "#f8f9fa", color: "#6c757d", fontSize: "14px", letterSpacing: "0.5px" }}>
            &copy; 2026 Gyeongun School Configuration System. All rights reserved.
        </footer>
      </body>
    </html>
  );
}
