import type { Metadata } from "next";
import "./globals.css";
import DiceLink from "./ui/dicelink";
import { Suspense } from "react";
import { LanguageSelector } from "@/components/component/language-selector";
import { headers } from 'next/headers'

export const metadata: Metadata = {
  title: (process.env.NODE_ENV === 'development' ? '(dev) ' : '')
    + "MulAI - Multi genAIs",
  description: "Let's chat with multiple genAIs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = headers().get('x-negotiated-locale') as string

  return (
    // suppressHydrationWarnings to deal with grammarly and other extentions
    // https://stackoverflow.com/questions/75337953/what-causes-nextjs-warning-extra-attributes-from-the-server-data-new-gr-c-s-c
    <html className="overscroll-none" suppressHydrationWarning={true}>
      <body className="flex flex-col h-dvh overscroll-none" suppressHydrationWarning={true}>
        <header className="w-screen bg-teal-600 text-white text-xs p-4 h-14 flex flex-row">
          <a className='flex-1 text-xl hover:text-teal-100 active:text-teal-50  whitespace-nowrap' href="/"><h1>
            <strong className="font-bold">MulAI</strong> - Chat with Multiple genAIs
          </h1></a>
          {/* copyright @twk all rights reserved */}
          <a className='pt-1 text-teal-700 whitespace-nowrap overflow-x-hidden' href="https://twitter.com/twk" target="_blank" rel="noopener noreferrer">author: @twk</a>
          <Suspense>
            <DiceLink className="ml-3 mr-1 hover:text-teal-100 active:text-teal-50" />
            <LanguageSelector locale={locale} className="focus-visible:outline-none ml-1 hover:text-teal-100 active:text-teal-50" />
          </Suspense>
        </header>
        {children}
      </body>
    </html>
  );
}
