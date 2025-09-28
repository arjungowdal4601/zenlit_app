import type { Metadata, Viewport } from "next";
import { VisibilityProvider } from "@/contexts/VisibilityContext";
import "./globals.css";
import "../styles/animations.css";

export const metadata: Metadata = {
  title: "Zenlit - Location Based Networking",
  description: "Connect with people nearby through location-based networking",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Zenlit"
  },
  formatDetection: {
    telephone: false
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#2563eb'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Zenlit" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body
        className="antialiased"
      >
        <VisibilityProvider>
          {children}
        </VisibilityProvider>
      </body>
    </html>
  );
}
