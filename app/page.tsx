'use client';

import { ChatRequestOptions } from 'ai';
import { useChat } from 'ai/react';
import { useState } from 'react';
import Chat from './chat'

export default function Page() {
  const chats:any = []
  const chatModels = ['gpt-3.5-turbo', 'gpt-4-turbo-preview']
  let parentInput:any

  // initialize ai models
  chatModels.forEach((model, index)=>{
    // const { messages, input, handleInputChange, handleSubmit } = useChat()
    chats[index] = useChat()
    chats[index].initialModel = chatModels[index]
    if (index === 0) {
      parentInput = chats[index].input
    }
  })

  const parentHandleInputChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
    chats.map((chat:any, index:number) => {
      chat.setInput(e.currentTarget.value)
    })    
  }

  // form submit handler
  const handleChatSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()    
    chats.map((chat:any, index:number) => {
      chat.handleSubmit(e)
    })
  }

  return (<>
    <header className="flex h-fit bg-blue-500 text-white text-xl p-4 md:h-fit mb-6">
      <h1 className="font-bold"><a href="/">MulAI</a></h1>
    </header>
    <div className='flex w-full stretch'>
      {chats.map((m:any, index:number) => (
        <Chat key={index} initialModel={m.initialModel} messages={m.messages} input={m.input} handleInputChange={m.handleInputChange} handleSubmit={m.handleSubmit} />
      ))}

      {/*
      <div className='resize-x border-s-2 overflow-auto min-w-12' >
      </div> 
      */}

      <form onSubmit={handleChatSubmit} className='fixed bottom-0 w-full'>
        <input
          className="w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
          value={parentInput}
          onChange={parentHandleInputChange}
          placeholder="Say something..."
        />
      </form>
    </div>
    </>
  );
}