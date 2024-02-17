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
    // suppressHydrationWarnings to deal with grammarly and other extentions
    // https://stackoverflow.com/questions/75337953/what-causes-nextjs-warning-extra-attributes-from-the-server-data-new-gr-c-s-c
    <html className="overscroll-none" suppressHydrationWarning={true}>
      <body className="flex flex-col h-dvh overscroll-none" suppressHydrationWarning={true}>
        <header className="w-screen bg-teal-600 text-white text-xs p-4 h-14 flex flex-row">
          <a className='flex-1 text-xl hover:text-teal-100 active:text-teal-50  whitespace-nowrap' href="/"><h1>
            <strong className="font-bold">MulAI</strong> - Chat with Multiple genAIs
          </h1></a>
          <Suspense>
            <DiceLink className="px-2 hover:text-teal-100 active:text-teal-50" />
          </Suspense>
          {/* copyright @twk all rights reserved */}
          <a className='pt-1 text-teal-700 whitespace-nowrap overflow-x-hidden' href="https://twitter.com/twk" target="_blank" rel="noopener noreferrer">author: @twk</a>
        </header>
        {children}
      </body>
    </html>
  );
}
