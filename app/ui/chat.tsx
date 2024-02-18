'use client';
 
import { ChatRequestOptions, Message } from 'ai';
import { ChatOptions } from './chatOptions'
import { RefreshCwIcon, Minimize2Icon, Maximize2Icon, SendIcon, XIcon, PlusIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import CharacterSelector from './characterSelector';
import { Character, CharacterValue, ModelValue, getModelByValue } from '../lib/common';
import ModelSelector from './modelSelector';
import { useChat } from 'ai/react';
const Markdown = require('react-markdown-it')

const defaultAssistantPromptContent = 'Understood.'
const defaultAssistantPromptContent_ja = 'かしこまりました。'
const allCharacters:Character[] = [
  {
    "value": "",
    "label": "Normal",
    "promptContent_ja": "こんにちは。よろしくお願いしますね。",
    "promptContent": "Hello.",
    assistantPromptContent_ja: 'こんにちは！何かお手伝いできることはありますか？',
    assistantPromptContent: 'Hello! How can I assist you today?',
  },
  {
    "value": "child",
    "label": "Child",
    "promptContent_ja": "小学生でもわかるように説明してください。",
    "promptContent": "Please explain in a way that even an elementary school student would understand."
  },
  {
    "value": "bullets",
    "label": "Bullets",
    "promptContent_ja": "箇条書きで簡潔に答えて",
    "promptContent": "Answer concisely in bullet points."
  },
  {
    "value": "steps",
    "label": "Steps",
    "promptContent_ja": "ステップバイステップで答えてください。",
    "promptContent": "Please answer step by step."
  },
  {
    "value": "proofreading",
    "label": "Proofread",
    "promptContent_ja": "次の文章を校正して、校正箇所について日本語で理由を教えてください。",
    "promptContent": "Please correct the following sentences and explain the reasons in English for the corrections."
  },
  {
    "value": "optimist",
    "label": "Optimist",
    "promptContent_ja": "楽観的な観点で、物事がうまく行く可能性を前向きに考えて回答してください。",
    "promptContent": "From an optimistic viewpoint, please answer with a positive outlook on the possibilities of things going well."
  },
  {
    "value": "pessimist",
    "label": "Pessimist",
    "promptContent_ja": "悲観的な観点で、物事がうまく行かなくなる可能性を注意深く予測して回答してください。",
    "promptContent": "From a pessimistic viewpoint, please answer by carefully predicting the possibilities of things not going well."
  },
  {
    "value": "melchior",
    "label": "Scientist",
    "promptContent_ja": "科学者の側面から、論理的かつ分析的に回答してください。",
    "promptContent": "From a scientist's perspective, please answer logically and analytically."
  },
  {
    "value": "balthasar",
    "label": "Mother",
    "promptContent_ja": "母の側面から、保護的かつ愛情深く回答してください。",
    "promptContent": "From a mother's perspective, please answer protectively and with deep affection."
  },
  {
    "value": "caspar",
    "label": "Woman",
    "promptContent_ja": "女性としての側面から、直感的かつ柔軟な思考で回答してください。",
    "promptContent": "From a woman’s perspective, please answer with intuitive and flexible thinking."
  }
]
const getAvailableCharacters = (modelValue:string):Character[] => {
  //   return []
  // Currently returning the same characters for any models
  return allCharacters
}
const getCharacter = (characterValue:CharacterValue) => {
  return allCharacters.find((character) => character.value === characterValue)
}

const getAILabel = (modelValue:ModelValue, characterValue:CharacterValue) => {
  const modelLabel = getModelByValue(modelValue)?.label
  if (characterValue !== '') {
    const characterLabel = getCharacter(characterValue)?.label
    return `${modelLabel} (${characterLabel})`  
  } else {
    return modelLabel
  }
}

export default function Chat({modelValue, initialCharacterValue, index, totalLength, locale, updatePaneSize, setChatOptions, changeModel, changeCharacter, changeChatLoading, addPane, removePane}:{
  modelValue:ModelValue,
  initialCharacterValue:CharacterValue,
  index:number, 
  totalLength:number,
  locale:string,
  updatePaneSize:(index:number, operation:'minimize' | 'maximize' | 'restore')=>void,
  setChatOptions:(index:number, value:ChatOptions)=>void,
  changeModel:(index:number, newModelValue:ModelValue)=>void,
  changeCharacter:(index:number, newCharacterValue:CharacterValue)=>void,
  changeChatLoading:(index:number, newLoadingValue:boolean)=>void,
  addPane:()=>void,
  removePane:(index:number)=>void,
}) 
{
  const [characterValue, setCharacterValue] = useState(initialCharacterValue ?? '' as CharacterValue)
  const historyElementRef = useRef(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [isUsingIME, setIsUsingIME] = useState(false)

  const [acceptsBroadcast, setAcceptsBroadcast] = useState(true)

  const initMessages = () => {
    setCharacterMessages(initialCharacterValue as CharacterValue)
  }

  const chatOptions:ChatOptions =  {...useChat(), acceptsBroadcast: acceptsBroadcast, setAcceptsBroadcast: setAcceptsBroadcast, initMessages}
  const [isSplitLoaded, setIsSplitLoaded] = useState(false)

  // console.log('chat is being initialized with=' + modelValue)
  setChatOptions(index, chatOptions)

  let characters = getAvailableCharacters(modelValue)

  useEffect(() => {
    // Not checking the load status but wait for a while to improve UX
    setIsSplitLoaded(true)
  }, [])

  useEffect(() => {
    initMessages()
  }, [])

  useEffect(() => {
    changeChatLoading(index, chatOptions.isLoading)
  }, [chatOptions.isLoading])

  useEffect(() => {
    if (historyElementRef.current) {
      // Scroll
      const resizeObserver = new ResizeObserver(entries => {
        for (const entry of entries) {
          // console.log('resize top=', entry.target.scrollTop, ', height=', entry.target.scrollHeight);
          const historyElement = historyElementRef.current as unknown as Element
          historyElement.scrollTop = historyElement.scrollHeight
        }
      });

      // Called when the new answer is added
      let lastObservedNode:Element
      const mutationObserver = new MutationObserver(entries => {
        for (const mutation of entries) {
          // only childList is being observed
          // if (mutation.type !== 'childList')
          //   continue;

          // Set the resize observer to the last node which should be the expanding
          // console.log('added nodes=', mutation.addedNodes.length)
          const addedNode = mutation.addedNodes.item(mutation.addedNodes.length - 1)

          if (addedNode?.nodeType !== Node.ELEMENT_NODE) {
            console.log('node type=', addedNode?.nodeType)
            continue;
          }

          if (lastObservedNode)
            resizeObserver.unobserve(lastObservedNode)
          
          const addedElement = addedNode as Element
          resizeObserver.observe(addedElement)
          lastObservedNode = addedElement
        }
      });

      mutationObserver.observe(historyElementRef.current, { attributes: false, characterData: false, childList: true });

      // cleanup
      return () => {
        // console.log('cleaning observers'); 
        mutationObserver.disconnect()
        resizeObserver.disconnect()
      };
    }
  }, []);

  const handleChatSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // overwrite model
    console.log('requesting model:' + modelValue)
    const options:ChatRequestOptions = {options:{headers:{model: modelValue}}}

    e.preventDefault()
    chatOptions.handleSubmit(e, options)
  }

  const handleReload = () => {
    const options:ChatRequestOptions = {options:{headers:{model: modelValue}}}
    chatOptions.reload(options)
  }

  const handleMinimizePaneSize = () => {
    updatePaneSize(index, "minimize")
  }

  const handleMaxmizePaneSize = () => {
    updatePaneSize(index, "maximize")
  }

  const handleClosePane = () => {
    removePane(index)
  }

  const handleAddPane = () => {
    addPane()
  }

  function setCharacterMessages(value: CharacterValue) {
    const character = getCharacter(value)
    if (character?.promptContent === '') {
      // FIXME if you change to a different value and then back to normal, the value should be reset
      return
    }

    // console.log('loc:', locale)
    const localizedPromptContent = locale === 'ja' ? character?.promptContent_ja : character?.promptContent
    const assistantPromptContent = locale === 'ja' 
      ? (character?.assistantPromptContent_ja ?? defaultAssistantPromptContent_ja)
      : (character?.assistantPromptContent ?? defaultAssistantPromptContent)
    chatOptions.setMessages([
      // GPT understands the system message but gemini prefers conversations
      // {role: 'system', content:localizedPromptContent} as Message, 
      {role: 'user', content:localizedPromptContent} as Message,
      {role: 'assistant', content:assistantPromptContent} as Message,
    ])
    setCharacterValue(value)
  }

  function handleCharacterChange(e:React.ChangeEvent<HTMLSelectElement>) {
    const characterValue = e.target.value as CharacterValue
    setCharacterMessages(characterValue)
    changeCharacter(index, characterValue)
  }

  function handleModelChange(e:React.ChangeEvent<HTMLSelectElement>) {
    const modelValue = e.target.value as ModelValue
    console.log('changing model to:', modelValue)
    changeModel(index, modelValue)
  }

  // trigger enter key
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement> | React.KeyboardEvent<HTMLTextAreaElement>) => {
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

  return (<>
    <article className="flex flex-col w-full pt-2 h-full">
      <div className='px-3'>
        <ModelSelector selectedValue={modelValue} onChange={handleModelChange} /> 
        <CharacterSelector selectedValue={characterValue} characters={characters} onChange={handleCharacterChange} />
      </div>
      <div className='flex-1 overflow-y-auto w-full' ref={historyElementRef}>
      {chatOptions.messages.map((m, index) => (
        <div key={index} className={
          "rounded-sm px-2 py-1 m-1 max-w-full text-sm leading-normal overflow-x-auto prose prose-sm prose-p:mt-1 prose-p:mb-3 prose-pre:my-0 prose-pre:mt-1 prose-pre:mb-3 " + 
          (m.role === "user"
            ? "bg-slate-100"
            : m.role === "assistant"
            ? ""
            : process.env.NODE_ENV !== 'development'
            ? "hidden" // system
            : "bg-gray-100 text-gray-400"
        )}>
          <div className='font-bold text-xs'>{m.role === 'user' ? 'User: ' 
          : m.role === 'assistant' ? 'AI: '
          : 'System: '}</div>
          {m.role === "user" 
            ? <div className='whitespace-pre-wrap'>{m.content}</div>
            : <Markdown source={m.content} />
            }
        </div>
      ))}
      </div>
 
      <form ref={formRef} onSubmit={handleChatSubmit} className={(isSplitLoaded ? 'opacity-100 ' : 'opacity-0 ') + 'transition-opacity duration-50 bottom-0 bg-slate-50 px-2 pt-1 rounded-sm'}>
        <div className='flex flex-row w-full'>
          <div className="flex-1 whitespace-nowrap overflow-hidden">
            <strong>{getAILabel(modelValue, characterValue)}</strong>
          </div>
          <button className="mt-1 ml-1 disabled:text-gray-300 enabled:text-slate-700 enabled:hover:text-teal-700 enabled:active:text-teal-600" onClick={handleMinimizePaneSize}>
            <Minimize2Icon className="h-3 w-3" />
            <span className="sr-only">Minimize</span>
          </button>
          <button className="ml-1 disabled:text-gray-300 enabled:text-slate-900 enabled:hover:text-teal-700 enabled:active:text-teal-600" onClick={handleMaxmizePaneSize}>
            <Maximize2Icon className="h-3 w-3" />
            <span className="sr-only">Maximize</span>
          </button>
          <button className='ml-1 disabled:text-gray-300 enabled:text-slate-900 enabled:hover:text-teal-700 enabled:active:text-teal-600'
            disabled={totalLength <= 1} 
            onClick={handleClosePane}>
            <XIcon className="h-3 w-3" />
            <span className='sr-only'>Close</span>
          </button>  
          <button className='ml-1 disabled:hidden enabled:text-slate-900 enabled:hover:text-teal-700 enabled:active:text-teal-600'
            disabled={index !== totalLength - 1} 
            onClick={handleAddPane}>
            <PlusIcon className="h-3 w-3" />
            <span className='sr-only'>Add</span>
          </button>  
        </div>
        <div className='flex w-full'>
          <textarea
            className="flex-1 p-2 my-1 border border-gray-300 rounded h-8 resize-none overflow-hidden"
            value={chatOptions.input}
            onChange={chatOptions.handleInputChange}
            onKeyDown={handleInputKeyDown}
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
            placeholder="Say something to this model..."
          />

          {/* disabled is useful to stop submitting with enter */}
          <button type="submit" 
            className='ml-1 disabled:text-gray-300 enabled:text-teal-900 enabled:hover:text-teal-700 enabled:active:text-teal-600' 
            disabled={chatOptions.input.length === 0 || chatOptions.isLoading}>
            <SendIcon className="h-5 w-5" />
            <span className="sr-only">Send</span>
          </button>
          <button className="ml-1 disabled:text-gray-300 enabled:text-teal-900 enabled:hover:text-teal-700 enabled:active:text-teal-600" 
            onClick={handleReload} disabled={chatOptions.isLoading || chatOptions.messages.length < 2}>
            <RefreshCwIcon className="h-4 w-4" />
            <span className="sr-only">Reload</span>
          </button>
        </div>
        <label className='whitespace-nowrap overflow-hidden'>
          <input type="checkbox" className='mr-1'
            checked={acceptsBroadcast}
            onChange={() => setAcceptsBroadcast(!acceptsBroadcast)}
          />
          Accepts Broadcast
        </label>
      </form>
    </article>
    </>
  );
}