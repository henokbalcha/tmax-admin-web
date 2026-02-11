import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "T-MAX Admin | Control Center",
  description: "Advanced inventory, order management, and analytics dashboard for T-MAX Electronics.",
  keywords: ["T-MAX", "Power Banks", "Flash", "Charger & Cable", "Dividers", "Laptop Chargers", "Mobile batteries", "Admin Panel", "Inventory Management"],
  authors: [{ name: "T-MAX Team" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
          (function() {
            const theme = localStorage.getItem('theme') || 'dark';
            document.documentElement.setAttribute('data-theme', theme);
          })()
        ` }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          <Sidebar />
          <main style={{
            flex: 1,
            marginLeft: 'var(--sidebar-width)',
            padding: '2rem',
            backgroundColor: 'var(--bg-app)',
            minHeight: '100vh'
          }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
