import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "動物の救急手帳",
  description: "Emergency Pet Pass"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
