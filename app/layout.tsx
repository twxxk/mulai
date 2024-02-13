import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MulAI - Multi genAIs",
  description: "Let's chat with multiple genAIs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <body className="flex flex-col h-screen">
        {children}
      </body>
    </html>
  );
}
