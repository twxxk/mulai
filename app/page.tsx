import { Suspense } from 'react';
import ChatsArea from './ui/chatsArea';

export default function Page() {
  return (<>
    <Suspense>
      <ChatsArea />
    </Suspense>    
  </>);
}