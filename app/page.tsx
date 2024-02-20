import { Suspense } from 'react';
import ChatsArea from './ui/chatsArea';
import { ChatsAreaSkeleton } from './ui/skeltons';
import { headers } from 'next/headers'

export default function Page() {
  const locale = headers().get('x-negotiated-locale') as string
  // console.log('pagelocale=' + locale)

  return (<>
    {/* 
      <ChatsAreaSkeleton /> 
    */}
    <Suspense fallback={<ChatsAreaSkeleton />}>
      <ChatsArea locale={locale} />
    </Suspense>    
  </>);
}