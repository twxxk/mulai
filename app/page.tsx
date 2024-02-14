'use client';

import { ChatRequestOptions } from 'ai';
import { useChat } from 'ai/react';
import Chat from './chat'
import { useRef, useState } from 'react';
import { ChatModel } from './chatModel'
import { SendIcon, StopCircleIcon, Trash2Icon } from 'lucide-react';
import Split from 'react-split'

// 2 => [50, 50], 4 => [25, 25, 25, 25]
function splitToArray(num:number) {
  return Array(num).fill(100/num)
}

export default function Page() {
  // const chatModelNames = ['gpt-3.5-turbo'] // for debug
  // const chatModelNames = ['gemini-pro'] // for debug
  const chatModelNames = ['gpt-3.5-turbo', 'gpt-4-turbo-preview', 'gemini-pro']

  const [parentInput, setParentInput] = useState('')
  const [isUsingIME, setIsUsingIME] = useState(false)
  const [splitSizes, setSplitSizes] = useState(splitToArray(chatModelNames.length))

  const formRef = useRef<HTMLFormElement>(null);
  
  const chats:ChatModel[] = []

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
    const chat:ChatModel = {...useChat(), model: model, setModel: setModel, isEnabled: isEnabled, setIsEnabled: setIsEnabled}

    chats[index] = chat
  })

  // Split onDragStart={onDragStart}
  // const onDragStart = (sizes:number[]) => {
  //   console.log('current sizes=', sizes)
  // }

  const updatePaneSize = (updateIndex:number, operation:'minimize' | 'maximize' | 'restore') => {
    const currentValue = splitSizes[updateIndex]
    // console.log('index=', updateIndex, ', operation=' + operation, 'currentValue=', currentValue)

    // check current state and overwrite operation
    switch (operation) {
      case 'minimize':
        if (currentValue === 0) operation = 'restore'
        break;
      case 'maximize':
        if (currentValue === 100) operation = 'restore'
        break;
      default:
        console.log('unexpected operation=' + operation + ', index=' + updateIndex)
        break;
    }

    // do the actual operation
    const operations:any = {
      'minimize': calcMinimizePaneSizes, 
      'maximize': calcMaximizePaneSizes, 
      'restore': calcRestorePaneSizes
    }
    const calcSizes = operations[operation] as (updateIndex:number) => number[]
    const newSizes = calcSizes(updateIndex)
    setSplitSizes(newSizes)

    function calcMinimizePaneSizes(updateIndex:number) {
      // e.g. [33.3, 33.3, 33.3] => [50, 50, 0]
      const updateSize = 0
      const otherSize = 100/(splitSizes.length - 1)

      const newSizes = splitSizes.map((size, index) => 
        index === updateIndex ? updateSize : otherSize
      )

      // console.log('min=', newSizes)
      return newSizes
    }
    function calcMaximizePaneSizes(updateIndex:number) {
      // e.g. [33.3, 33.3, 33.3] => [0, 0, 100] 
      // sizes will be adjusted to min by the library automatically
      const updateSize = 100
      const otherSize = 0

      const newSizes = splitSizes.map((size, index) => 
        index === updateIndex ? updateSize : otherSize
      )

      // console.log('max=', newSizes)
      return newSizes
    }
    function calcRestorePaneSizes(updateIndex:number) {
      // e.g. [50, 50, 0] => [33.3, 33.3, 33.3]
      // [0, 0, 100] => [33.3, 33.3, 33.3]
      const averageSize = 100/(splitSizes.length) // 33.3
      if (splitSizes.length === 1) {
        console.log('unexpected splitSizes')
        return;
      }
      const adjustValue = (currentValue - averageSize)/(splitSizes.length - 1) // -33.3/2

      const newSizes = splitSizes.map((size, index) => 
        index === updateIndex ? averageSize : size + adjustValue
      )

      // console.log('restore=', newSizes)
      return newSizes
    }
  }

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
    <header className="w-screen bg-teal-600 text-white text-xl p-4 h-14 flex flex-row">
      <a className='flex-1' href="/"><h1>
        <span className="font-bold">MulAI</span> - Chat with Multiple genAIs
      </h1></a>
      <a className='text-xs pt-1 text-teal-700' href="https://twitter.com/twk" target="_blank" rel="noopener noreferrer">author: @twk</a>
    </header>
    <Split gutterSize={8} minSize={180} sizes={splitSizes} className="flex-1 flex flex-row w-full text-xs m-0 overflow-auto">
      {chats.map((chat:ChatModel, index:number) => (
        <Chat key={index} index={index} chatModel={chat} updatePaneSize={updatePaneSize} />
      ))}
    </Split>
    <form ref={formRef} onSubmit={handleChatSubmit} className='w-screen h-12 bottom-0 flex'>
      <textarea
        className="p-2 border border-gray-300 rounded flex-1 text-sm m-1"
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