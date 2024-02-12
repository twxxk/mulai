import { UseChatHelpers, useChat } from 'ai/react';
import { Dispatch, SetStateAction, useState } from 'react';

export type ChatModel = UseChatHelpers & { model: string, setModel: Dispatch<SetStateAction<string>> }
