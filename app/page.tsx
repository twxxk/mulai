'use client';

import { ChatRequestOptions } from 'ai';
import { useChat } from 'ai/react';
import Chat from './chat'
import { useRef, useState } from 'react';
import { ChatModel } from './chatModel'
import { SendIcon, StopCircleIcon, Trash2Icon } from 'lucide-react';

export default function Page() {
  const [parentInput, setParentInput] = useState('')
  const [isUsingIME, setIsUsingIME] = useState(false)
  const formRef = useRef<HTMLFormElement>(null);
  
  const chats:ChatModel[] = []
  // const chatModelNames = ['gpt-3.5-turbo'] // for debug
  const chatModelNames = ['gpt-3.5-turbo', 'gpt-4-turbo-preview', 'gemini-pro']

  // return true if any chat is loading
  const isLoadingAnyChat = () => {
    // console.log('called'); 
    return chats.some((chat:ChatModel) => chat.isLoading)
  }

  // initialize ai models
  chatModelNames.forEach((modelName, index)=>{
    // The order is always same so far. https://legacy.reactjs.org/docs/hooks-rules.html
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [model, setModel] = useState(modelName)
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [isEnabled, setIsEnabled] = useState(true)
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [paneSize, setPaneSize] = useState('')
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const chat:ChatModel = {...useChat({
      onFinish: () => {
        // scroll to the latest bottom of the chat history
        const historyId = 'chatHistory' + index
        const div:any = document.getElementById(historyId);
        // console.log(`his ${div.scrollTop} ${div.scrollHeight}`)
        // div.scrollTop = div.scrollHeight;
        div.scrollTo({
          top: div.scrollHeight,
          left: 0,
          behavior: 'smooth'
        })
      }
    }), model: model, setModel: setModel, isEnabled: isEnabled, setIsEnabled: setIsEnabled}

    chats[index] = chat
  })

  const parentHandleInputChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.currentTarget.value
    setParentInput(newValue)

    // copy parent input value to children inputs
    chats.map((chat:ChatModel, index:number) => {
      if (!chat.isEnabled)
        return;

      chat.setInput(newValue)
    })
  }

  // trigger enter key
  const parentHandleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement> | React.KeyboardEvent<HTMLTextAreaElement>) => {
    // console.log(e.currentTarget.value)

    // submit only if the key is enter
    if (e.key !== 'Enter' || e.shiftKey || isUsingIME)
      return;

    e.preventDefault();

    // trigger form submission
    if (formRef.current) {
      // console.log('submitting')
      formRef.current.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    }
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

    // make sure map is called with the old value
    setTimeout(()=>setParentInput(''), 100)
  }

  const handleStop = () => {
    console.log('stopping')      
    chats.map((chat:ChatModel, index:number) => chat.stop())
  }

  const handleTrash = () => {
    // Stop to prevent getting responses after trash
    handleStop()
    console.log('trashing')
    chats.map((chat:ChatModel) => {
      chat.setInput('')
      chat.setMessages([])
    })
  }

  return (<>
    <header className="w-screen bg-teal-600 text-white text-xl p-4 h-14">
      <a href="/"><h1><span className="font-bold">MulAI</span> - Chat with Multiple genAIs</h1></a>
    </header>
    <main className='flex-1 flex flex-row w-full text-xs mt-1 overflow-auto'>
      {chats.map((chat:ChatModel, index:number) => (
        <Chat key={index} index={index} chatModel={chat} 
          />
      ))}
    </main>
    <form ref={formRef} onSubmit={handleChatSubmit} className='w-screen h-12 bottom-0 flex'>
      <textarea
        className="p-2 border border-gray-300 rounded flex-1 text-sm mr-1"
        value={parentInput}
        onChange={parentHandleInputChange}
        onKeyDown={parentHandleInputKeyDown}
        onCompositionStart={() => setIsUsingIME(true)}
        onCompositionEnd={() => setIsUsingIME(false)}        
        placeholder="Say something to all models..."
      />
      {/* disabled is useful to stop submitting with enter */}
      <button type="submit" 
        className={(isLoadingAnyChat() ? 'hidden' : 'p-1') 
          + ' disabled:text-gray-300 enabled:text-teal-900 enabled:hover:text-teal-700 enabled:active:text-teal-600'} 
        disabled={parentInput.length === 0 || isLoadingAnyChat()}>
        <SendIcon className="h-5 w-5" />
        <span className="sr-only">Send</span>
      </button>
      <button onClick={handleStop} 
        className={(!isLoadingAnyChat() ? 'hidden' : 'p-1') 
          + ' disabled:text-gray-300 enabled:text-teal-900 enabled:hover:text-teal-700 enabled:active:text-teal-600'}>
        <StopCircleIcon className="h-5 w-5" />
        <span className="sr-only">Stop</span>
      </button>
      <button onClick={handleTrash} 
        className='p-1 disabled:text-gray-300 enabled:text-teal-900 enabled:hover:text-teal-700 enabled:active:text-teal-600'>
        <Trash2Icon className="h-5 w-5" />
        <span className="sr-only">Trash</span>
      </button>
    </form>
  </>);
}