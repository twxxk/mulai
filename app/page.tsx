'use client';

import { ChatRequestOptions } from 'ai';
import { useChat } from 'ai/react';
import Chat from './chat'
import { useState } from 'react';
import { ChatModel } from './chatModel'

export default function Page() {
  const chats:ChatModel[] = []
//  const chatModels = ['gpt-3.5-turbo', 'gpt-4-turbo-preview']
  const chatModelNames = ['gemini-pro', 'gpt-4-turbo-preview']
  let parentInput = ''

  // initialize ai models
  chatModelNames.forEach((modelName, index)=>{
    // const { messages, input, handleInputChange, handleSubmit } = useChat()
    const [model, setModel] = useState(modelName)
    const chat:ChatModel = {...useChat(), model: model, setModel:setModel}
    chats[index] = chat

    // parent input is a clone of the first input
    if (index === 0) {
      parentInput = chat.input
    }
  })

  const parentHandleInputChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
    // copy parent input value to children inputs
    chats.map((chat:ChatModel, index:number) => {
      chat.setInput(e.currentTarget.value)
    })    
  }

  // form submit handler
  const handleChatSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()    
    chats.map((chat:ChatModel, index:number) => {
      console.log('requesting model=' + chat.model)
      const options:ChatRequestOptions = {options:{headers:{model: chat.model}}}
  
      chat.handleSubmit(e, options)
    })
  }

  return (<>
    <header className="fixed w-screen bg-blue-500 text-white text-xl p-4 mb-6">
      <h1 className="font-bold"><a href="/">MulAI</a></h1>
    </header>
    <div className='flex w-full stretch text-sm'>
      {chats.map((chat:ChatModel, index:number) => (
        <Chat key={index} chatModel={chat} />
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