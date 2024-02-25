'use client';

import { ChatRequestOptions } from 'ai';
import Chat, { getCharacter } from './chat'
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation'
import { ChatOptions } from './chatOptions'
import { SendIcon, StopCircleIcon, Trash2Icon } from 'lucide-react';
import { DEFAULT_MODEL, DEFAULT_CHARACTER_VALUE, ModelCharacterPair, ModelValue, Character } from '@/app/lib/common';
import { useRouter } from 'next/navigation';
import EnterableTextarea from './enterableTextarea';
import { generateUrlToReplace, getModelCharacterValues } from '../lib/urlhandler';
import Splitter, { SplitDirection } from '@devbookhq/splitter'

// 2 => [50, 50], 4 => [25, 25, 25, 25]
function splitToArray(num:number) {
  return Array(num).fill(100/num)
}

export default function ChatsArea({locale}:{locale:string}) {
  const searchParams = useSearchParams()
  const modelsParam = searchParams.get('models')
  const [modelCharacterValues, setModelCharacterValues] = useState(getModelCharacterValues(modelsParam ?? ''))
  // console.log('mc', modelCharacterValues)

  const [parentInput, setParentInput] = useState('')
  let splitSizes = splitToArray(modelCharacterValues.length)

  const formRef = useRef<HTMLFormElement>(null);
  const [isLoadingAnyChat, setIsLoadingAnyChat] = useState(false)
  const isUsingIME = useRef(false)

  const chats:ChatOptions[] = []

  const router = useRouter()
  const urlToReplace = generateUrlToReplace(searchParams, modelCharacterValues)

  const [verticalSizes, setVerticalSizes] = useState([95, 5]);
  const [horizontalSizes, setHorizontalSizes] = useState([] as number[]);

  // useEffect(() => {
  //   console.log('Re-rendered form');
  // }, [formRef.current]);   

  // generate browser url based on models and characters
  useEffect(() => {
    // console.log('checking url')
    router.replace(urlToReplace)
  }, [router, urlToReplace])

  // trap escape key to interrupt responses
  // FIXME Warning: React Hook useEffect has a missing dependency: 'handleStop'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
  useEffect(() => {
    const handleKeyDown = (e:any) => {
      const event = e as React.KeyboardEvent
      if (event.key !== "Escape") {
        return;
      }
      // if commented out, not work with safari with IME
      if (isUsingIME.current) {
        // console.log('using ime', new Date)
        return;
      }
      e.preventDefault();
      handleStop()
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const changeChatLoading = (index:number, value:boolean) => {
    setIsLoadingAnyChat(chats.some((chat:ChatOptions) => chat.isLoading))
  }

  const setChatOptions = (index:number, chat:ChatOptions) => {
    chats[index] = chat
  }

  const onChangeCharacter = (index:number, character:Character) => {
    const newValues = modelCharacterValues.map((value, i) =>
      i !== index ? value : {modelValue: value.modelValue, characterValue:character.value}
    )
    console.log('changing to new character', newValues)
    setModelCharacterValues(newValues)
  }

  const onChangeModel = (index:number, modelValue:ModelValue) => {
    const newValues = modelCharacterValues.map((value, i) =>
      i !== index ? value : {modelValue: modelValue, characterValue:value.characterValue}
    )
    console.log('changing to new models', newValues)
    setModelCharacterValues(newValues)
  }

  const removeModel = (index:number) => {
    const newValues = modelCharacterValues.filter((_, i) => i !== index)
    console.log('changing to new models', newValues, splitToArray(newValues.length))
    setModelCharacterValues(newValues)
    splitSizes = splitToArray(newValues.length)
  }

  const addModel = () => {
    const newValues = [
      ...modelCharacterValues, 
      {modelValue: DEFAULT_MODEL.modelValue, characterValue: DEFAULT_CHARACTER_VALUE}
    ]
    console.log('changing to new models', newValues, splitToArray(newValues.length))
    setModelCharacterValues(newValues)
    splitSizes = splitToArray(newValues.length)
  }

  // You can debug by adding onDragStart={onDragStart} to with <Split />
  // const onDragStart = (sizes:number[]) => {
  //   console.log('current sizes=', sizes)
  // }

  const updatePaneSize = (updateIndex:number, operation:'minimize' | 'maximize' | 'restore') => {
    // const currentValue = splitSizes[updateIndex]
    // // console.log('index=', updateIndex, ', operation=' + operation, 'currentValue=', currentValue)

    // // check current state and overwrite operation
    // switch (operation) {
    //   case 'minimize':
    //     if (currentValue === 0) operation = 'restore'
    //     break;
    //   case 'maximize':
    //     if (currentValue === 100) operation = 'restore'
    //     break;
    //   default:
    //     console.log('unexpected operation=' + operation + ', index=' + updateIndex)
    //     break;
    // }

    // // do the actual operation
    // const operations:any = {
    //   'minimize': calcMinimizePaneSizes, 
    //   'maximize': calcMaximizePaneSizes, 
    //   'restore': calcRestorePaneSizes
    // }
    // const calcSizes = operations[operation] as (updateIndex:number) => number[]
    // const newSizes = calcSizes(updateIndex)
    // splitSizes = newSizes

    // function calcMinimizePaneSizes(updateIndex:number) {
    //   // e.g. [33.3, 33.3, 33.3] => [50, 50, 0]
    //   const updateSize = 0
    //   const otherSize = 100/(splitSizes.length - 1)

    //   const newSizes = splitSizes.map((size, index) => 
    //     index === updateIndex ? updateSize : otherSize
    //   )

    //   // console.log('min=', newSizes)
    //   return newSizes
    // }
    // function calcMaximizePaneSizes(updateIndex:number) {
    //   // e.g. [33.3, 33.3, 33.3] => [0, 0, 100] 
    //   // sizes will be adjusted to min by the library automatically
    //   const updateSize = 100
    //   const otherSize = 0

    //   const newSizes = splitSizes.map((size, index) => 
    //     index === updateIndex ? updateSize : otherSize
    //   )

    //   // console.log('max=', newSizes)
    //   return newSizes
    // }
    // function calcRestorePaneSizes(updateIndex:number) {
    //   // e.g. [50, 50, 0] => [33.3, 33.3, 33.3]
    //   // [0, 0, 100] => [33.3, 33.3, 33.3]
    //   const averageSize = 100/(splitSizes.length) // 33.3
    //   if (splitSizes.length === 1) {
    //     console.log('unexpected splitSizes')
    //     return;
    //   }
    //   const adjustValue = (currentValue - averageSize)/(splitSizes.length - 1) // -33.3/2

    //   const newSizes = splitSizes.map((size, index) => 
    //     index === updateIndex ? averageSize : size + adjustValue
    //   )

    //   // console.log('restore=', newSizes)
    //   return newSizes
    // }
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

  // form submit handler
  // submit all children chats
  const handleChatSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    chats.map((chat:ChatOptions, index:number) => {
      if (!chat.acceptsBroadcast)
        return;

      console.log('requesting model=' + modelCharacterValues[index].modelValue)
      const modelValue = modelCharacterValues[index].modelValue
      const options:ChatRequestOptions = {options:{headers:{model: modelValue}}}
  
      chat.handleSubmit(e, options)
    })

    // make sure map is called with the old value
    setTimeout(()=>setParentInput(''), 100)
  }

  // stop chat
  const handleStop = () => {
    chats.map((chat:ChatOptions, index) => {
      // Sometimes fails to stop. Need more investigation
      console.log('stopping:', index, ':', chat.isLoading)
      chat.stop()
    })
  }

  const handleTrash = () => {
    // Stop to prevent getting responses after trash
    handleStop()
    console.log('trashing')
    chats.map((chat:ChatOptions) => {
      chat.setInput('')
      chat.resetMessages()
    })
  }

  // Need to set the initialsizes to keep the resizes after updating the inputs
  function handleVerticalResize(gutterIdx: number, allSizes: number[]) {
    // console.log('gutterIdx', gutterIdx);
    // console.log('vertical allSizes in %', allSizes);
    setVerticalSizes(allSizes);
  }
  function handleHorizontalResize(gutterIdx: number, allSizes: number[]) {
    // console.log('gutterIdx', gutterIdx);
    // console.log('horizontal allSizes in %', allSizes);
    setHorizontalSizes(allSizes);
  }
    
  return (
  <Splitter initialSizes={verticalSizes} direction={SplitDirection.Vertical} draggerClassName='dragger-vertical' gutterClassName="gutter gutter-vertical" key={modelCharacterValues.length} classes={['flex flex-row text-xs overflow-auto flex-1 min-h-0', 'w-screen h-12 bottom-0 flex min-h-16']} onResizeFinished={handleVerticalResize}
  >
    <Splitter initialSizes={horizontalSizes} direction={SplitDirection.Horizontal} minWidths={Array(modelCharacterValues.length).fill(180)}  draggerClassName='dragger-horizontal' gutterClassName="gutter gutter-horizontal" onResizeFinished={handleHorizontalResize}>
      {modelCharacterValues.map((value:ModelCharacterPair, index:number) => {
        const key = index + ':' + value.modelValue + ':' + value.characterValue
        const hasClosePaneButton = modelCharacterValues.length > 1
        const hasAddPaneButton = index === modelCharacterValues.length - 1
        return (
          <Chat key={key} index={index} locale={locale}
            hasClosePaneButton={hasClosePaneButton} hasAddPaneButton={hasAddPaneButton}
            modelValue={value.modelValue} character={getCharacter(value.characterValue)}
            setChatOptions={setChatOptions} onChangeModel={onChangeModel} onChangeCharacter={onChangeCharacter}
            changeChatLoading={changeChatLoading}
            addPane={addModel} removePane={removeModel} 
            onCompositeChange={(value)=>isUsingIME.current = value}
            />
      )})}
    </Splitter>
    <form ref={formRef} onSubmit={handleChatSubmit} className='w-screen bottom-0 flex text-xs'>
      <EnterableTextarea 
        autoFocus={true}
        className="p-2 border border-gray-300 rounded flex-1 text-sm m-1 resize-none overflow-hidden"
        value={parentInput}
        onChange={parentHandleInputChange}
        onEnter={()=>{
          if (formRef.current)
            formRef.current.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
        }}
        onCompositeChange={(value)=>isUsingIME.current = value}
        placeholder="Say something to all models..."
      />
      {/* disabled is useful to stop submitting with enter */}
      <button type="submit" 
        className={(isLoadingAnyChat ? 'disabled:hidden' : '') 
          + ' p-1 disabled:text-gray-300 enabled:text-teal-900 enabled:hover:text-teal-700 enabled:active:text-teal-600'} 
        disabled={parentInput.length === 0 || isLoadingAnyChat}>
        <SendIcon className="h-5 w-5" />
        <span className="sr-only">Send</span>
      </button>
      <button onClick={handleStop} 
        className={'p-1 disabled:hidden disabled:text-gray-300 enabled:text-teal-900 enabled:hover:text-teal-700 enabled:active:text-teal-600'}
        disabled={!isLoadingAnyChat}>
        <StopCircleIcon className="h-5 w-5" />
        <span className="sr-only">Stop</span>
      </button>
      <button onClick={handleTrash} 
        className='p-1 disabled:text-gray-300 enabled:text-teal-900 enabled:hover:text-teal-700 enabled:active:text-teal-600'>
        <Trash2Icon className="h-5 w-5" />
        <span className="sr-only">Trash</span>
      </button>
    </form>
  </Splitter>
  );
}
