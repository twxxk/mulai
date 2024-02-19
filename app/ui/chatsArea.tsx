'use client';

import { ChatRequestOptions } from 'ai';
import Chat from './chat'
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation'
import { ChatOptions } from './chatOptions'
import { SendIcon, StopCircleIcon, Trash2Icon } from 'lucide-react';
import Split from 'react-split'
import { CharacterValue, DEFAULT_MODEL, DEFAULT_CHARACTER_VALUE, ModelCharacterPair, ModelValue, validateModelCharacter } from '@/app/lib/common';
import { useRouter } from 'next/navigation';

// 2 => [50, 50], 4 => [25, 25, 25, 25]
function splitToArray(num:number) {
  return Array(num).fill(100/num)
}

// for debug
const freeValues:ModelCharacterPair[] = [
  {modelValue: 'gemini-pro', characterValue: ''},
  {modelValue: 'gemini-1.0-pro-latest', characterValue: ''},
  {modelValue: 'gemini-1.0-pro-latest', characterValue: ''},
  {modelValue: 'gemini-1.0-pro-latest', characterValue: ''},
  {modelValue: 'gemini-1.0-pro-latest', characterValue: ''},
]
// for production
const bestQualityValues:ModelCharacterPair[] = [
  {modelValue: 'gpt-3.5-turbo', characterValue: ''},
  {modelValue: 'gpt-4-turbo-preview', characterValue: ''},
  {modelValue: 'gemini-1.0-pro-latest', characterValue: ''},
  {modelValue: 'gemini-pro', characterValue: ''},
  {modelValue: 'japanese-stablelm-instruct-beta-70b', characterValue: ''},
  {modelValue: 'firellava-13b', characterValue: ''},
]
// for debug purpose
// const allValues:ModelCharacterPair[] = [
//   {modelValue: 'gpt-3.5-turbo', characterValue: ''},
//   {modelValue: 'gpt-4', characterValue: ''},
//   {modelValue: 'gpt-4-turbo-preview', characterValue: ''},
//   {modelValue: 'gemini-1.0-pro-latest', characterValue: ''},
//   {modelValue: 'gemini-pro', characterValue: ''},
//   {modelValue: 'japanese-stablelm-instruct-beta-70b', characterValue: ''},
//   {modelValue: 'japanese-stablelm-instruct-gamma-7b', characterValue: ''},
//   {modelValue: 'firellava-13b', characterValue: ''},
//   {modelValue: 'qwen-14b-chat', characterValue: ''},
//   {modelValue: 'qwen-72b-chat', characterValue: ''},
//   {modelValue: 'mixtral-8x7b-instruct', characterValue: ''},
//   {modelValue: 'llama-v2-7b-chat', characterValue: ''},
//   {modelValue: 'llama-v2-13b-chat', characterValue: ''},
//   {modelValue: 'llama-v2-70b-chat', characterValue: ''},
// ]

const specialPairs:{[key:string]:ModelCharacterPair[]} = {
  default: (process.env.NODE_ENV === 'development' ? freeValues : bestQualityValues).slice(0, 3),
  magi: [
    {modelValue: 'gemini-1.0-pro-latest', characterValue: 'melchior'},
    {modelValue: 'gemini-1.0-pro-latest', characterValue: 'balthasar'},
    {modelValue: 'gemini-1.0-pro-latest', characterValue: 'caspar'},
  ],
  optpess: [
    {modelValue: 'gemini-1.0-pro-latest', characterValue: 'optimist'},
    {modelValue: 'gemini-1.0-pro-latest', characterValue: 'pessimist'},
  ],
  gemini: [
    {modelValue: 'gemini-1.0-pro-latest', characterValue: ''},
    {modelValue: 'gemini-pro', characterValue: ''},
  ],
  gpt: [
  {modelValue: 'gpt-3.5-turbo', characterValue: ''},
  {modelValue: 'gpt-4', characterValue: ''},
  {modelValue: 'gpt-4-turbo-preview', characterValue: ''},
  ]
}

function deepCopy(originalObject:object) {
  return JSON.parse(JSON.stringify(originalObject));
}

function getModelCharacterValues(modelsParam:string):ModelCharacterPair[] {
  // console.log('param:', modelsParam)
  // for debug
  // if (modelsParam === '') 
  //   return allValues.slice(10, 10+3)

  // needs deep copy to return the special pairs as changing models update the original object
  // default, no params
  if (modelsParam === '') {
    return deepCopy(specialPairs.default)
  }

  // Evangelion
  if (modelsParam === 'magi') {
    return deepCopy(specialPairs.magi)
  }
  if (modelsParam === 'optpess') {
    return deepCopy(specialPairs.optpess)
  }
  if (modelsParam === 'gemini') {
    return deepCopy(specialPairs.gemini)
  }
  if (modelsParam === 'gpt') {
    return deepCopy(specialPairs.gpt)
  }

  // 1..5. Only shorthand to longhand. No generate this url.
  const modelsNumber = parseInt(modelsParam ?? '0')
  if (modelsNumber >= 1 && modelsNumber <= 5)
    return bestQualityValues.slice(0, modelsNumber)

  // model1(:character1),model2(:character2),...
  return modelsParam.split(',').map((value, index) => {
    const [modelValueString, characterValueString] = value.split(':')
    return validateModelCharacter(modelValueString, characterValueString ?? '') // undefined => ''
  })
}

// generate /?models={return} from the current models and characters
function generateModelsParam(modelCharacters:ModelCharacterPair[]):string {
  // console.log('now', modelCharacters)
  const matched = Object.entries(specialPairs).find(([key, pairs]) => {
    // console.log(key, 'pairs', pairs)
    if (pairs.length != modelCharacters.length) return false;
    return pairs.every((lhsPair, index) => {
      const rhsPair = modelCharacters.at(index) as ModelCharacterPair
      if (!rhsPair) return false
      return lhsPair.modelValue === rhsPair.modelValue && (lhsPair.characterValue ?? '') === (rhsPair.characterValue ?? '')
    })
  })
  // console.log(matched)
  if (matched) {
    const key = matched[0]
    if (key === 'default') return ''
    return key
  }

  let a:string[] = []
  modelCharacters.map((modelCharacter) => {
    // console.log('character:', modelCharacter.characterValue)
    const mc = modelCharacter.modelValue + (modelCharacter.characterValue ? ':' + modelCharacter.characterValue : '')
    a.push(mc)
  })
  return a.join(',')
}

function generateUrlToReplace(searchParams:ReadonlyURLSearchParams, modelCharacterValues:ModelCharacterPair[]): string{
  const paramString:string = generateModelsParam(modelCharacterValues)

  let newSearchParams:string[][] = []
  searchParams.forEach((value, key) => {
    // delete
    if (key === 'models' && paramString === '')
      return;
    // update
    newSearchParams.push([key, key === 'models' ? paramString : value])
  })

  // add
  if (!searchParams.has('models') && paramString !== '')
    newSearchParams.push(['models', paramString])

  const newSearchString = newSearchParams
    .map(([key, value]:string[]) => key + '=' + value)
    .join('&')   
  // console.log('model or character is updated. generated a new url:', paramString, 'new:', newSearchString)

  if (newSearchString.length > 0)
    return '/?' + newSearchString
  else
    return '/'
}

export default function ChatsArea({locale}:{locale:string}) {
  const searchParams = useSearchParams()
  const modelsParam = searchParams.get('models')
  const [modelCharacterValues, setModelCharacterValues] = useState(getModelCharacterValues(modelsParam ?? ''))

  const [parentInput, setParentInput] = useState('')
  const [isUsingIME, setIsUsingIME] = useState(false)
  const [splitSizes, setSplitSizes] = useState(splitToArray(modelCharacterValues.length))

  const formRef = useRef<HTMLFormElement>(null);
  const defaultFocusRef = useRef<HTMLTextAreaElement>(null);
  const [isLoadingAnyChat, setIsLoadingAnyChat] = useState(false)

  const chats:ChatOptions[] = []

  const router = useRouter()

  // generate url based on models and characters
  // need to call router function in useEffect. location is not defined
  useEffect(() => {
    router.replace(generateUrlToReplace(searchParams, modelCharacterValues))
  }, [modelCharacterValues])

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
  
  const changeChatLoading = (index:number, value:boolean) => {
    setIsLoadingAnyChat(chats.some((chat:ChatOptions) => chat.isLoading))
  }

  const setChatOptions = (index:number, chat:ChatOptions) => {
    chats[index] = chat
  }

  const changeCharacter = (index:number, characterValue:CharacterValue) => {
    let newValues = modelCharacterValues.slice()
    newValues[index].characterValue = characterValue
    console.log('changing to new character', newValues)
    setModelCharacterValues(newValues)
  }

  const changeModel = (index:number, modelValue:ModelValue) => {
    let newValues = modelCharacterValues.slice()
    newValues[index].modelValue = modelValue // keep character
    console.log('changing to new models', newValues)
    setModelCharacterValues(newValues)
  }

  const removeModel = (index:number) => {
    let newValues = modelCharacterValues.slice()
    newValues.splice(index, 1)
    console.log('changing to new models', newValues, splitToArray(newValues.length))
    setModelCharacterValues(newValues)
    setSplitSizes(splitToArray(newValues.length))
  }

  const addModel = () => {
    let newValues = modelCharacterValues.slice()
    const modelValue:ModelValue = DEFAULT_MODEL.modelValue
    newValues.push({modelValue, characterValue:DEFAULT_CHARACTER_VALUE})
    console.log('changing to new models', newValues, splitToArray(newValues.length))
    setModelCharacterValues(newValues)
    const newSplitSizes = splitToArray(newValues.length)
    setSplitSizes(newSplitSizes)
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
      chat.initMessages()
    })
  }

  return (<>
  <Split minSize={50} sizes={[95, 5]} direction="vertical" className="flex-1 w-full m-0 flex flex-col min-h-0" key={modelCharacterValues.length}>
    <Split gutterSize={8} minSize={180} sizes={splitSizes} className="flex flex-row text-xs overflow-auto flex-1 min-h-0">
      {modelCharacterValues.map((value:ModelCharacterPair, index:number) => (
        <Chat key={index} index={index} totalLength={modelCharacterValues.length} locale={locale}
          modelValue={value.modelValue} initialCharacterValue={value.characterValue}
          setChatOptions={setChatOptions} changeModel={changeModel} changeCharacter={changeCharacter}
          changeChatLoading={changeChatLoading}
          addPane={addModel} removePane={removeModel} updatePaneSize={updatePaneSize} />
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
  </Split>
  </>);
}