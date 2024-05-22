import type { Metadata } from "next";
import "./globals.css";
import ModelLinks from "./ui/modelLinks";
import { Suspense } from "react";
import { LanguageSelector } from "@/components/component/language-selector";
import { headers } from 'next/headers'
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { LocaleProvider } from "@/lib/client/locale-context"
import InfoLinks from "../lib/client/info-links";

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
  // console.log('locale', locale)

  return (
    // suppressHydrationWarnings to deal with grammarly and other extentions
    // https://stackoverflow.com/questions/75337953/what-causes-nextjs-warning-extra-attributes-from-the-server-data-new-gr-c-s-c
    <html lang={locale} className="overscroll-none" suppressHydrationWarning>
      <body className="flex flex-col h-dvh overscroll-none" suppressHydrationWarning>
        <LocaleProvider locale={locale}>
          <header className="w-screen bg-teal-600 text-white text-xs p-4 h-14 flex flex-row">
            <a className='flex-1 text-xl hover:text-teal-100 active:text-teal-50  whitespace-nowrap' href="/"><h1>
            <strong className="font-bold">MulAI</strong>
              {(locale == 'ja') 
                ? <> - <span title="Multi AIs">いろんなAI</span>と話そう</>
                : <> - Chat with Multiple genAIs</>
              }
            </h1></a>
            <a className="mx-4 text-lg" 
                    href="https://forms.gle/7TrHHb1mfRmwjg8R6"
                    target="_blank" rel="noopener noreferrer">{
                      (locale == 'ja') ? 'アンケートにご協力ください!' : 'Plase help us improve the service!'
                    }</a>            
            <Suspense>
              <ModelLinks
                className="focus-visible:outline-none ml-2 mr-1 hover:text-teal-100 active:text-teal-50" />
              <LanguageSelector
                className="focus-visible:outline-none ml-1 mr-1 hover:text-teal-100 active:text-teal-50" />
              <InfoLinks selectedService="mulai"
                className="focus-visible:outline-none ml-1 hover:text-teal-100 active:text-teal-50" />
            </Suspense>
          </header>
          {children}
        </LocaleProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

