import { Suspense } from 'react';
import ChatsArea from './ui/chatsArea';
import { ChatsAreaSkeleton } from './ui/skeltons';

export default function Page() {
  return (<>
    {/* 
      <ChatsAreaSkeleton /> 
    */}
    <Suspense fallback={<ChatsAreaSkeleton />}>
      <ChatsArea />
    </Suspense>    
  </>);
}