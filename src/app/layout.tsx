import "./globals.css";
import type { Metadata } from "next";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ServiceWorkerRegister } from "@/components/providers/service-worker-provider";

export const metadata: Metadata = {
  title: "動物の救急手帳",
  description: "Emergency Pet Pass"
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
