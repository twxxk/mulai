import { UseChatHelpers } from 'ai/react';
import { Dispatch, SetStateAction } from 'react';
import { ModelLabel } from './common';

export type ChatModel = UseChatHelpers & { 
    acceptsBroadcast: boolean, setAcceptsBroadcast: Dispatch<SetStateAction<boolean>>,
    model: ModelLabel, setModel: Dispatch<SetStateAction<ModelLabel>> 
}
