import type { Metadata } from "next";
import "./globals.css";
import DiceLink from "./ui/dicelink";
import { Suspense } from "react";

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
        <header className="w-screen bg-teal-600 text-white text-xs p-4 h-14 flex flex-row">
          <a className='flex-1 text-xl hover:text-teal-100 active:text-teal-50' href="/"><h1>
            <span className="font-bold">MulAI</span> - Chat with Multiple genAIs
          </h1></a>
          <Suspense>
            <DiceLink className="px-2 hover:text-teal-100 active:text-teal-50" />
          </Suspense>
          <a className='pt-1 text-teal-700' href="https://twitter.com/twk" target="_blank" rel="noopener noreferrer">author: @twk</a>
        </header>
        {children}
      </body>
    </html>
  );
}
