'use client';

import { ChatRequestOptions } from 'ai';
import { useChat } from 'ai/react';
import Chat from './chat'
import { useState } from 'react';
import { ChatModel } from './chatModel'

export default function Page() {
  const chats:ChatModel[] = []
  const chatModelNames = ['gpt-3.5-turbo', 'gpt-4-turbo-preview', 'gemini-pro']
  let parentInput = ''

  // initialize ai models
  chatModelNames.forEach((modelName, index)=>{
    // The order is always same so far. https://legacy.reactjs.org/docs/hooks-rules.html
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [model, setModel] = useState(modelName)
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [isEnabled, setIsEnabled] = useState(true)
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const chat:ChatModel = {...useChat(), model: model, setModel: setModel, isEnabled: isEnabled, setIsEnabled: setIsEnabled}

    chats[index] = chat

    // parent input is a clone of the first input
    if (index === 0) {
      parentInput = chat.input
    }
  })

  const parentHandleInputChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
    // copy parent input value to children inputs
    chats.map((chat:ChatModel, index:number) => {
      // index==0 is connected to the parent input
      // if (!chat.isEnabled)
      //   return;

      chat.setInput(e.currentTarget.value)
    })    
  }

  // form submit handler
  const handleChatSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()    
    chats.map((chat:ChatModel, index:number) => {
      if (!chat.isEnabled)
        return;

      // console.log('requesting model=' + chat.model)
      const options:ChatRequestOptions = {options:{headers:{model: chat.model}}}
  
      chat.handleSubmit(e, options)
    })
  }

  return (<>
    <header className="fixed w-screen bg-blue-500 text-white text-xl p-4 h-14">
      <a href="/"><h1><span className="font-bold">MulAI</span> - Chat with Multiple genAIs</h1></a>
    </header>
    <main className='flex-grow flex flex-row w-full stretch text-xs overflow-auto mt-16 mb-16'>
      {chats.map((chat:ChatModel, index:number) => (
        <Chat key={index} chatModel={chat} />
      ))}
    </main>
    <form onSubmit={handleChatSubmit} className='fixed w-screen h-12 bottom-0'>
      <input
        className="w-full p-2 border border-gray-300 rounded"
        value={parentInput}
        onChange={parentHandleInputChange}
        placeholder="Say something to all models..."
      />
    </form>
  </>);
}