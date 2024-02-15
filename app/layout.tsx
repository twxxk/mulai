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
        <header className="w-screen bg-teal-600 text-white text-xl p-4 h-14 flex flex-row">
          <a className='flex-1' href="/"><h1>
            <span className="font-bold">MulAI</span> - Chat with Multiple genAIs
          </h1></a>
          <a className='text-xs pt-1 text-teal-700' href="https://twitter.com/twk" target="_blank" rel="noopener noreferrer">author: @twk</a>
        </header>
        {children}
      </body>
    </html>
  );
}
