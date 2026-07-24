import "./globals.css";
import type { Metadata } from "next";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ServiceWorkerRegister } from "@/components/providers/service-worker-provider";

export const metadata: Metadata = {
  title: "AniLink",
  description: "ペットの命を守る医療情報・救急管理プラットフォーム - AniLink"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className="dark" style={{ colorScheme: "dark" }} suppressHydrationWarning>
      <body>
        <ThemeProvider defaultTheme="dark" storageKey="theme">
          <ServiceWorkerRegister />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
