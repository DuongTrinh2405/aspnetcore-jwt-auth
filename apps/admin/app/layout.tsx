import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "../components/AuthProvider";
import { PwaLifecycle } from "../components/PwaLifecycle";

export const metadata: Metadata = {
  title: "CNL Admin",
  description: "Bảng điều phối và quản trị dịch vụ Châu Ngọc Long.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CNL Admin"
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
        <AuthProvider>
          {children}
          <PwaLifecycle />
        </AuthProvider>
      </body>
    </html>
  );
}
