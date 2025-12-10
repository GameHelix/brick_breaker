import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Brick Breaker - Classic Arkanoid Game",
  description: "Play the classic brick breaker game with powerups and multiple levels",
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
