import { UseChatHelpers, useChat } from 'ai/react';
import { Dispatch, SetStateAction, useState } from 'react';

export type ChatModel = UseChatHelpers & { 
    isEnabled: boolean, setIsEnabled: Dispatch<SetStateAction<boolean>>,
    model: string, setModel: Dispatch<SetStateAction<string>> 
}
