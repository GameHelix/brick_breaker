import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Brick Breaker - Classic Arkanoid Game",
  description: "Play the classic brick breaker game with powerups and multiple levels",
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
