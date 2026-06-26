import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "../components/AuthProvider";
import { PwaLifecycle } from "../components/PwaLifecycle";
import { PwaInstallProvider } from "../hooks/usePwaInstallPrompt";

export const metadata: Metadata = {
  title: "Trung tâm dịch vụ Châu Ngọc Long",
  description: "Đặt lịch lắp đặt, báo lỗi và theo dõi tiến độ dịch vụ kỹ thuật.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CNL Service"
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
      { url: "/icons/icon-512.svg", sizes: "512x512", type: "image/svg+xml" }
    ],
    apple: [{ url: "/icons/icon-192.svg", sizes: "192x192", type: "image/svg+xml" }]
  }
};

export const viewport: Viewport = {
  themeColor: "#2563EB"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <PwaInstallProvider>
          <AuthProvider>
            {children}
            <PwaLifecycle />
          </AuthProvider>
        </PwaInstallProvider>
      </body>
    </html>
  );
}
