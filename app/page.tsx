import { Suspense } from 'react';
import ChatsArea from './ui/chatsArea';
import { ChatsAreaSkeleton } from './ui/skeltons';
import { match } from '@formatjs/intl-localematcher'
import { headers } from 'next/headers'
import Negotiator from 'negotiator'

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