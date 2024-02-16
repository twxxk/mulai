'use client';
 
import { ChatRequestOptions, Message } from 'ai';
import { ChatOptions } from './chatOptions'
import { RefreshCwIcon, Minimize2Icon, Maximize2Icon, SendIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import CharacterSelector from './characterSelector';
import { Character, ModelValue } from '../lib/common';
import ModelSelector from './modelSelector';
import { useChat } from 'ai/react';
const Markdown = require('react-markdown-it')

const allCharacters:Character[] = [
  {value: 'normal', label: 'Normal', promptContent: ''},
  {value: 'child', label: '小学生', promptContent: '小学生でもわかるように説明して'},
  {value: 'bullets', label: '箇条書き', promptContent: '箇条書きで簡潔に答えて'},
  {value: 'steps', label: 'ステップ', promptContent: 'ステップバイステップで答えて'},
]
const getAvailableCharacters = (modelValue:string):Character[] => {
  //   return []
  return allCharacters
}
const getCharacter = (characterValue:string) => {
  return allCharacters.find((character) => character.value === characterValue)
}

export default function Chat({modelValue: modelValue, index, updatePaneSize, setChatOptions: setChatOptions, changeModel}:{
  modelValue:string,
  index:number, 
  updatePaneSize:(index:number, operation:'minimize' | 'maximize' | 'restore')=>void,
  setChatOptions:(index:number, value:ChatOptions)=>void,
  changeModel:(index:number, newModelValue:ModelValue)=>void,
}) 
{
  const [characterName, setCharacterName] = useState('')
  const historyElementRef = useRef(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [isUsingIME, setIsUsingIME] = useState(false)

  const [acceptsBroadcast, setAcceptsBroadcast] = useState(true)
  const chatOptions:ChatOptions =  {...useChat(), acceptsBroadcast: acceptsBroadcast, setAcceptsBroadcast: setAcceptsBroadcast}

  // console.log('chat is being initialized with=' + modelValue)
  setChatOptions(index, chatOptions)

  let characters = getAvailableCharacters(modelValue)

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
    console.log('requesting model=' + modelValue)
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

  function handleCharacterChange(e:React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value
    const character = getCharacter(value)
    if (character?.promptContent === '')
      return

    chatOptions.setMessages([
      // GPT understands the system message but gemini prefers conversations
      // {role: 'system', content:character?.promptContent} as Message, 
      {role: 'user', content:character?.promptContent} as Message,
      {role: 'assistant', content:`Understood: ${character?.promptContent}`} as Message,
    ])
    setCharacterName(value)
  }

  function handleModelChange(e:React.ChangeEvent<HTMLSelectElement>) {
    const modelValue = e.target.value as ModelValue
    console.log('changing model to=', modelValue)
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
    <div className="flex flex-col w-full pt-2 h-full">
      <div className='px-3'>
        <ModelSelector selectedValue={modelValue} onChange={handleModelChange} /> 
        <CharacterSelector selectedValue={characterName} characters={characters} onChange={handleCharacterChange} />
      </div>
      <div id={'chatHistory' + index} className='flex-1 overflow-y-auto w-full' ref={historyElementRef}>
      {chatOptions.messages.map(m => (
        <div key={m.id} className={
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
          <Markdown source={m.content} />
          {/* <div className='whitespace-pre-wrap whitespace-normal '>{m.content}</div> */}
        </div>
      ))}
      </div>
 
      <form ref={formRef} onSubmit={handleChatSubmit} className='bottom-0 bg-slate-50 px-2 pt-1 rounded-sm'>
        <div className='flex flex-row w-full'>
          <div className="flex-1">
            <strong>{modelValue.replace(/.*\//, '')}</strong>
          </div>
          <button className="mt-1 ml-1 disabled:text-gray-300 enabled:text-slate-700 enabled:hover:text-teal-700 enabled:active:text-teal-600" onClick={handleMinimizePaneSize}>
            <Minimize2Icon className="h-3 w-3" />
            <span className="sr-only">Minimize</span>
          </button>
          <button className="ml-1 disabled:text-gray-300 enabled:text-slate-900 enabled:hover:text-teal-700 enabled:active:text-teal-600" onClick={handleMaxmizePaneSize}>
            <Maximize2Icon className="h-3 w-3" />
            <span className="sr-only">Maximize</span>
          </button>
        </div>
        <div className='flex w-full'>
          {/* <input
            className="flex-1 p-2 my-1 border border-gray-300 rounded"
            value={chatOptions.input}
            placeholder="Say something to this model..."
            onChange={chatOptions.handleInputChange}
          /> */}
          <textarea
            className="flex-1 p-2 my-1 border border-gray-300 rounded h-8 resize-none"
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
        <label>
          <input type="checkbox" className='mr-1'
            checked={acceptsBroadcast}
            onChange={() => setAcceptsBroadcast(!acceptsBroadcast)}
          />
          Accepts Broadcast
        </label>
      </form>
    </div>
    </>
  );
}