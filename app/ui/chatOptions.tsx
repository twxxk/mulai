import { UseChatHelpers } from 'ai/react';
import { Dispatch, SetStateAction } from 'react';

export type ChatOptions = UseChatHelpers & { 
    acceptsBroadcast: boolean, 
    setAcceptsBroadcast: Dispatch<SetStateAction<boolean>>,
    resetMessages: ()=>void,
}
