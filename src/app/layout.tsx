import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import { ToastProvider } from "@/components/Toast";
import AppInit from "@/components/AppInit";

export const metadata: Metadata = {
  title: "What2eat - 今天吃什么",
  description: "温州家常菜 AI 助手",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-dvh pb-safe antialiased">
        <ToastProvider>
          <AppInit />
          <main className="mx-auto max-w-lg px-4 pt-4">{children}</main>
          <BottomNav />
        </ToastProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
