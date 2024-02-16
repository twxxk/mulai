'use client';

import { ChatRequestOptions } from 'ai';
import Chat from './chat'
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation'
import { ChatOptions } from './chatOptions'
import { SendIcon, StopCircleIcon, Trash2Icon } from 'lucide-react';
import Split from 'react-split'
import { ModelLabel, ModelValue } from '@/app/lib/common';

// 2 => [50, 50], 4 => [25, 25, 25, 25]
function splitToArray(num:number) {
  return Array(num).fill(100/num)
}

// @models '1' | '2' | '3' | '4'
function getChatModelValues(modelsParam:string):ModelValue[] {

  // for free debug
  if (modelsParam === 'free1') {
    return Array(1).fill('gemini-pro')
  } else if (modelsParam === 'free2') {
    return Array(2).fill('gemini-pro')
  } else if (modelsParam === 'free3') {
    return Array(3).fill('gemini-pro')
  } else if (modelsParam === 'free4') {
    return Array(4).fill('gemini-pro')
  } else if (modelsParam === 'free5') {
    return Array(5).fill('gemini-pro')
  }

  const modelsNumber = parseInt(modelsParam ?? '0')

  // default fallback
  if (isNaN(modelsNumber) || modelsNumber <= 0) {
    if (process.env.NODE_ENV === 'development') {
      // for free debug
      return ['gemini-pro', 'gemini-1.0-pro-latest']
    } else {
      return ['gpt-3.5-turbo', 'gpt-4-turbo-preview', 'gemini-pro', 'gemini-1.0-pro-latest']
    }
  }

  if (modelsNumber == 1) {
    return ['gemini-pro'] // for free debug
  } else if (modelsNumber == 2) {
    return ['gpt-3.5-turbo', 'gpt-4-turbo-preview']
  } else if (modelsNumber == 3) {
    return ['gpt-3.5-turbo', 'gpt-4-turbo-preview', 'gemini-pro']
  } else if (modelsNumber == 4) {
    return ['gpt-3.5-turbo', 'gpt-4-turbo-preview', 'gemini-pro', 'accounts/stability/models/japanese-stablelm-instruct-beta-70b']
  } else if (modelsNumber == 5) {
    return ['gpt-3.5-turbo', 'gpt-4-turbo-preview', 'gemini-pro', 'accounts/stability/models/japanese-stablelm-instruct-beta-70b', 'accounts/fireworks/models/firellava-13b']
  } else {
    // fallback to default
    return ['gpt-3.5-turbo', 'gpt-4-turbo-preview', 'gemini-pro']
  }
}

export default function ChatsArea() {
  const searchParams = useSearchParams()
  const modelsParam = searchParams.get('models')
  const [chatModelValues, setChatModelValues] = useState(getChatModelValues(modelsParam ?? ''))

  const [parentInput, setParentInput] = useState('')
  const [isUsingIME, setIsUsingIME] = useState(false)
  const [splitSizes, setSplitSizes] = useState(splitToArray(chatModelValues.length))

  const formRef = useRef<HTMLFormElement>(null);
  const defaultFocusRef = useRef<HTMLTextAreaElement>(null);

  const chats:ChatOptions[] = []

  // trap escape key to interrupt responses
  useEffect(() => {
    const handleKeyDown = (e:any) => {
      const event = e as React.KeyboardEvent
      if (event.key !== "Escape") {
        return;
      }
      if (isUsingIME) {
        // console.log('using ime', new Date)
        return;
      }
      e.preventDefault();
      
      // if (isLoadingAnyChat()) // not work
      handleStop()
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    defaultFocusRef.current?.focus()
  }, [])
  
  // return true if any chat is loading
  const isLoadingAnyChat = () => {
    // console.log('called'); 
    return chats.some((chat:ChatOptions) => chat.isLoading)
  }

  const setChatOptions = (index:number, chat:ChatOptions) => {
    chats[index] = chat
  }

  const changeModel = (index:number, newModelValue:ModelValue) => {
    let newValues = chatModelValues.slice()
    newValues[index] = newModelValue
    console.log('changing to new models', newValues)
    setChatModelValues(newValues)
  }

  // You can debug by adding onDragStart={onDragStart} to with <Split />
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
    chats.map((chat:ChatOptions, index:number) => {
      if (!chat.acceptsBroadcast)
        return;

      chat.setInput(newValue)
    })
  }

  // trigger enter key
  const parentHandleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement> | React.KeyboardEvent<HTMLTextAreaElement>) => {
    // console.log(e.currentTarget.value)

    // submit only if the key is enter
    if (e.key !== 'Enter' || e.shiftKey)
      return;

    if (isUsingIME) {
      // console.log('using ime', new Date)
      return;
    }
    
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
    chats.map((chat:ChatOptions, index:number) => {
      if (!chat.acceptsBroadcast)
        return;

      // console.log('requesting model=' + chat.model)
      const model = chatModelValues[index]
      const options:ChatRequestOptions = {options:{headers:{model}}}
  
      chat.handleSubmit(e, options)
    })

    // make sure map is called with the old value
    setTimeout(()=>setParentInput(''), 100)
  }

  const handleStop = () => {
    console.log('stopping')      
    chats.map((chat:ChatOptions, index:number) => chat.stop())
  }

  const handleTrash = () => {
    // Stop to prevent getting responses after trash
    // if (isLoadingAnyChat()) // not work
      handleStop()
    console.log('trashing')
    chats.map((chat:ChatOptions) => {
      chat.setInput('')
      chat.setMessages([])
    })
  }

  return (<>
  <Split minSize={50} sizes={[95, 5]} direction="vertical" className="flex-1 w-full m-0">
    <Split gutterSize={8} minSize={180} sizes={splitSizes} className="flex flex-row text-xs overflow-auto">
      {chatModelValues.map((label:string, index:number) => (
        <Chat key={index} index={index} modelValue={label as ModelValue} setChatOptions={setChatOptions} changeModel={changeModel} updatePaneSize={updatePaneSize} />
      ))}
    </Split>
    <form ref={formRef} onSubmit={handleChatSubmit} className='w-screen h-12 bottom-0 flex text-xs'>
      <textarea
        className="p-2 border border-gray-300 rounded flex-1 text-sm m-1 resize-none overflow-hidden"
        ref={defaultFocusRef}
        value={parentInput}
        onChange={parentHandleInputChange}
        onKeyDown={parentHandleInputKeyDown}
        onCompositionStart={() => setTimeout(() => {
          // To deal with the situation CompositionEnd then CompositionStart, both needs timeout
          // console.log('start', new Date)
          setIsUsingIME(true)
        }, 0)}
        onCompositionEnd={() => setTimeout(() => {
          // Needs timeout as Safari triggers CompositionEnd before KeyDown when pushing Enter
          // console.log('end', new Date)
          setIsUsingIME(false)
        }, 0)}
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
  </Split>
  </>);
}