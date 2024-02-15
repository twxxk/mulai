import { Suspense } from 'react';
import ChatsArea from './chatsArea';

export default function Page() {
  return (<>
    <Suspense>
      <ChatsArea />
    </Suspense>    
  </>);
}