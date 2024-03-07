'use client';
 
import { ChatRequestOptions, Message } from 'ai';
import { UseChatHelpers } from './chatOptions'
import { RefreshCwIcon, Minimize2Icon, Maximize2Icon, SendIcon, XIcon, PlusIcon, ClipboardCopyIcon } from 'lucide-react';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import CharacterSelector from './characterSelector';
import { ModelValue, doesModelAcceptImageUrl, getModelByValue } from '../lib/ai-model';
import ModelSelector from './modelSelector';
import { useChat } from 'ai/react';
import EnterableTextarea from './enterableTextarea';
import { LocaleContext, getTranslations } from '../lib/LocaleContext';
import ReactMarkdown, { defaultUrlTransform } from 'react-markdown';
import SyntaxHighlighter from 'react-syntax-highlighter/dist/esm/default-highlight'
import { a11yDark  } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import remarkGfm from 'remark-gfm';
import rehypeExternalLinks from 'rehype-external-links'
import { Character, CharacterValue } from '../lib/model-character';
import { EventName, eventBus } from '../lib/event-emitter';
import { FormEvent } from "react";

const defaultAssistantPromptContent = 'Understood.'
const defaultAssistantPromptContent_ja = 'かしこまりました。'
const allCharacters:Character[] = [
  {
    "value": "",
    "label": "Normal",
    "label_ja": "通常",
    "promptContent_ja": "こんにちは。よろしくお願いしますね。",
    "promptContent": "Hello.",
    assistantPromptContent_ja: 'こんにちは！何かお手伝いできることはありますか？',
    assistantPromptContent: 'Hello! How can I assist you today?',
  },
  {
    "value": "child",
    "label": "Child",
    "label_ja": "小学生",
    "promptContent_ja": "小学生でもわかるように説明してください。",
    "promptContent": "Please explain in a way that even an elementary school student would understand."
  },
  {
    "value": "bullets",
    "label": "Bullets",
    "label_ja": "箇条書き",
    "promptContent_ja": "箇条書きで簡潔に答えて",
    "promptContent": "Answer concisely in bullet points."
  },
  {
    "value": "steps",
    "label": "Steps",
    "label_ja": "ステップ",
    "promptContent_ja": "ステップバイステップで答えてください。",
    "promptContent": "Please answer step by step."
  },
  {
    "value": "proofreading",
    "label": "Proofread",
    "label_ja": "校正",
    "promptContent_ja": "次の文章を校正して、校正箇所について日本語で理由を教えてください。",
    "promptContent": "Please correct the following sentences and explain the reasons in English for the corrections."
  },
  {
    "value": "optimist",
    "label": "Optimist",
    "label_ja": "楽観的",
    "promptContent_ja": "楽観的な観点で、物事がうまく行く可能性を前向きに考えて回答してください。",
    "promptContent": "From an optimistic viewpoint, please answer with a positive outlook on the possibilities of things going well."
  },
  {
    "value": "pessimist",
    "label": "Pessimist",
    "label_ja": "悲観的",
    "promptContent_ja": "悲観的な観点で、物事がうまく行かなくなる可能性を注意深く予測して回答してください。",
    "promptContent": "From a pessimistic viewpoint, please answer by carefully predicting the possibilities of things not going well."
  },
  {
    "value": "melchior",
    "label": "Scientist",
    "label_ja": "科学者",
    "promptContent_ja": "科学者の側面から、論理的かつ分析的に回答してください。",
    "promptContent": "From a scientist's perspective, please answer logically and analytically."
  },
  {
    "value": "balthasar",
    "label": "Mother",
    "label_ja": "母親",
    "promptContent_ja": "母の側面から、保護的かつ愛情深く回答してください。",
    "promptContent": "From a mother's perspective, please answer protectively and with deep affection."
  },
  {
    "value": "caspar",
    "label": "Woman",
    "label_ja": "女性",
    "promptContent_ja": "女性としての側面から、直感的かつ柔軟な思考で回答してください。",
    "promptContent": "From a woman’s perspective, please answer with intuitive and flexible thinking."
  }
]
const getAvailableCharacters = (modelValue:string):Character[] => {
  //   return []
  // Currently returning the same characters for any models
  return allCharacters
}
export const getCharacter = (characterValue:CharacterValue) => {
  return allCharacters.find((character) => character.value === characterValue) as Character
}

const getAILabel = (modelValue:ModelValue, character:Character, locale:string) => {
  const modelLabel = getModelByValue(modelValue)?.label
  if (character.value !== '') {
    const characterLabel = locale == 'ja' ? character.label_ja : character.label
    return `${modelLabel} (${characterLabel})`  
  } else {
    return modelLabel
  }
}

function getLocalizedPromptMessages(locale:string, character: Character) { 
  // console.log('loc:', locale)
  const localizedPromptContent = locale === 'ja' ? character?.promptContent_ja : character?.promptContent
  const assistantPromptContent = locale === 'ja' 
    ? (character?.assistantPromptContent_ja ?? defaultAssistantPromptContent_ja)
    : (character?.assistantPromptContent ?? defaultAssistantPromptContent)
  
  return [
    // GPT understands the system message but gemini prefers conversations
    // {role: 'system', content:localizedPromptContent} as Message, 
    {role: 'user', content:localizedPromptContent} as Message,
    {role: 'assistant', content:assistantPromptContent} as Message,
  ]
}

function CodeCopyBtn({children}:{children:React.Component<any, any>}) {
  const handleClick = () => {
    navigator.clipboard.writeText(children?.props?.children);
  }
  return (
    <button onClick={handleClick} className="text-teal-600 enabled:hover:text-teal-500 enabled:active:text-teal-100">
      <ClipboardCopyIcon className="h-5 w-5" />
      <span className='sr-only'>Copy</span>
    </button>
  )
}

function ChatMessage({message}:{message:Message}) {
	const locale = useContext(LocaleContext)
  const {t} = getTranslations(locale)

  return (
  <div className={
    /* #2b2b2b=a11yDark */
    "rounded-sm px-2 py-1 m-1 max-w-full text-sm leading-normal prose prose-sm prose-p:mt-0 prose-pre:mt-1 prose-pre:mb-1 prose-pre:bg-[#2b2b2b] prose-img:my-1 " + 
    (message.role === "user"
      ? " bg-slate-100"
      : message.role === "assistant"
      ? " "
      : process.env.NODE_ENV !== 'development'
      ? " hidden" // system
      : " bg-gray-100 text-gray-400"
  )}>
    <div className={'font-bold text-xs ' +
      (message.role === 'user' ? ' text-slate-800'
      : ' text-teal-800')
    }>
      {message.role === 'user' ? t('user')
      : message.role === 'assistant' ? t('ai')
      : t('system')}
    </div>
    {message.role === "user" 
      ? <div className='whitespace-pre-wrap overflow-auto'>{message.content}</div>
      : <ReactMarkdown
          urlTransform={(url: string) => {
            // image data https://github.com/remarkjs/react-markdown/issues/774
            // console.log(url)
            if (url.startsWith('data:image/'))
              return url
            return defaultUrlTransform(url)
          }}
          rehypePlugins={[[rehypeExternalLinks, {target: '_blank'}]]}
          remarkPlugins={[remarkGfm]}
          components={{
            img({alt, ...props}) {
              // dynamic image, width/height are not clear
              /* eslint-disable @next/next/no-img-element */
              return (<img className="max-w-64 max-h-64" alt={alt ?? ''} {...props} />)
            },
            pre({children}) {
              return (
                <div className='relative'>
                  {children}
                  <div className='absolute top-1 right-1'>
                    <CodeCopyBtn>{children as any}</CodeCopyBtn>
                  </div>
                </div>
              )
            },
            code({className, children}) {
              const language = (/language-(\w+)/.exec(className || '') || ['',''])[1]
              if (language || String(children).length >= 50) {
                return (
                  <SyntaxHighlighter language={language} style={a11yDark} wrapLongLines={true}>
                    {children as any}
                  </SyntaxHighlighter>
                )
              } else {
                // inline
                return <code>{children}</code>
              }
            },
        }}>
        {message.content}
      </ReactMarkdown>
    }
  </div>
  )
}

export default function Chat({modelValue, character, index, hasClosePaneButton, hasAddPaneButton, setChatOptions, onChangeModel, onChangeCharacter, changeChatLoading, addPane, removePane, onCompositeChange, inputValue, imageUrl}:{
  index:number, 
  modelValue:ModelValue,
  character:Character,
  hasClosePaneButton:boolean,
  hasAddPaneButton:boolean,
  setChatOptions:(index:number, value:UseChatHelpers)=>void,
  onChangeModel:(index:number, newModelValue:ModelValue)=>void,
  onChangeCharacter:(index:number, newCharacter:Character)=>void,
  changeChatLoading:(index:number, newLoadingValue:boolean)=>void,
  addPane:()=>void,
  removePane:(index:number)=>void,
  onCompositeChange?:(newValue:boolean)=>void,
  inputValue:string,
  imageUrl:string,
}) 
{
	const locale = useContext(LocaleContext)
  const {t} = getTranslations(locale)

  const [acceptsBroadcast, setAcceptsBroadcast] = useState(true)
  const chatOptions:UseChatHelpers = useChat()

  // reset chat messages
  const resetMessages = useCallback(() => {
    // console.log('resetting msg')
    const initialMessages = getLocalizedPromptMessages(locale, character)    
    chatOptions.setMessages(initialMessages)
  }, [locale, character, chatOptions])

  useEffect(() => {
    if (acceptsBroadcast) {
      let childValue
      if (imageUrl && !doesModelAcceptImageUrl(modelValue)) {
        // if the model does not accept separate fields
        childValue = imageUrl + "\n" + inputValue
      } else
        childValue = inputValue
      chatOptions.setInput(childValue)
    }
  }, [chatOptions, acceptsBroadcast, inputValue, modelValue, imageUrl])

  const historyElementRef = useRef(null);
  const formRef = useRef<HTMLFormElement>(null);

  let characters = getAvailableCharacters(modelValue)

  useEffect(() => 
    setChatOptions(index, chatOptions),
    [index, chatOptions, setChatOptions]
  )

  useEffect(() => {
    console.log('call reset')
    resetMessages()
    // if you add resetMessages/setChatOptions, the reset is called whenever input/ouput is updated
  }, [])

  useEffect(() => {
    // console.log('change chat loading ', index)
    changeChatLoading(index, chatOptions.isLoading)
  }, [changeChatLoading, index, chatOptions.isLoading])

  useEffect(() => {
    if (historyElementRef.current) {
      // Scroll
      const resizeObserver = new ResizeObserver(entries => {
        for (const entry of entries) {
          // console.log('resize top=', entry.target.scrollTop, ', height=', entry.target.scrollHeight);
          const historyElement = historyElementRef.current as unknown as Element
          // When you save source during develpment, historyElement could be null
          if (!historyElement) continue;
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
    e.preventDefault()

    const options:ChatRequestOptions = {
      options:{headers:{model: modelValue}},
      ...(doesModelAcceptImageUrl(modelValue) && imageUrl ? {
        data: {imageUrl},
      } : {}),
    }

    chatOptions.handleSubmit(e, options)
  }

  useEffect(() => {
    const handleSubmitBroadcastMessage = () => {
      // console.log('onsubmitbroadcast');
      if (!acceptsBroadcast)
        return;

      if (formRef.current) {
        // call handleChatSubmit
        formRef.current.requestSubmit()
      }      
    };
    eventBus.on(EventName.onSubmitBroadcastMessage, handleSubmitBroadcastMessage);
      
    return () => {
      eventBus.removeListener(EventName.onSubmitBroadcastMessage, handleSubmitBroadcastMessage);
    };
  }, [formRef, acceptsBroadcast]);

  useEffect(() => {
    const handleStop = () => {
      // Sometimes fails to stop. Need more investigation
      // console.log('stopping:', index, ':', isLoading)
      chatOptions.stop()
    }
    eventBus.on(EventName.onStopAll, handleStop);

    return () => {
      eventBus.removeListener(EventName.onStopAll, handleStop)
    }
  }, [chatOptions])

  useEffect(() => {
    const handleReset = () => {
      chatOptions.setInput('')
      resetMessages()
    }
    eventBus.on(EventName.onResetAll, handleReset);

    return () => {
      eventBus.removeListener(EventName.onResetAll, handleReset)
    }
  }, [chatOptions, resetMessages])

  const handleReload = () => {
    const options:ChatRequestOptions = {options:{headers:{model: modelValue}}}
    chatOptions.reload(options)
  }

  // const handleMinimizePaneSize = () => {
  //   updatePaneSize(index, "minimize")
  // }

  // const handleMaxmizePaneSize = () => {
  //   updatePaneSize(index, "maximize")
  // }

  const handleClosePane = () => {
    removePane(index)
  }

  function handleChangeCharacter(e:React.ChangeEvent<HTMLSelectElement>) {
    const characterValue = e.target.value as CharacterValue
    const character = getCharacter(characterValue)
    onChangeCharacter(index, character)
  }

  function handleChangeModel(e:React.ChangeEvent<HTMLSelectElement>) {
    const modelValue = e.target.value as ModelValue
    console.log('changing model to:', modelValue)
    onChangeModel(index, modelValue)
  }

  return (<>
    <article className="flex flex-col w-full h-full">
      <div className='flex-1 overflow-y-auto w-full' ref={historyElementRef}>
        <div className='px-3 py-1 font-bold text-teal-800'>{t('ai')}<span className='text-teal-800'>{getAILabel(modelValue, character, locale)}</span></div>
        {chatOptions.messages.map((m, index) => (
          <ChatMessage key={index} message={m} />
        ))}
      </div>
 
      <form ref={formRef} onSubmit={handleChatSubmit} className='transition-opacity duration-50 bottom-0 bg-slate-50 px-2 pt-1 rounded-sm'>
        <div className='flex flex-row mb-1 w-full align-text-top'>
          <div className="flex-1">
            <ModelSelector selectedValue={modelValue} onChange={handleChangeModel} /> 
            <CharacterSelector selectedValue={character.value} characters={characters} onChange={handleChangeCharacter} />
          </div>
          {/* <button className="mt-1 ml-1 disabled:text-gray-300 enabled:text-slate-700 enabled:hover:text-teal-700 enabled:active:text-teal-600" onClick={handleMinimizePaneSize}>
            <Minimize2Icon className="h-3 w-3" />
            <span className="sr-only">Minimize</span>
          </button>
          <button className="ml-1 disabled:text-gray-300 enabled:text-slate-900 enabled:hover:text-teal-700 enabled:active:text-teal-600" onClick={handleMaxmizePaneSize}>
            <Maximize2Icon className="h-3 w-3" />
            <span className="sr-only">Maximize</span>
          </button> */}
          <button className='h-4 ml-1 disabled:text-gray-300 enabled:text-slate-900 enabled:hover:text-teal-700 enabled:active:text-teal-600'
            disabled={!hasClosePaneButton} 
            onClick={handleClosePane}>
            <XIcon className="h-3 w-3" />
            <span className='sr-only'>Close</span>
          </button>  
          <button className='h-4 ml-1 disabled:hidden enabled:text-slate-900 enabled:hover:text-teal-700 enabled:active:text-teal-600'
            disabled={!hasAddPaneButton} 
            onClick={addPane}>
            <PlusIcon className="h-3 w-3" />
            <span className='sr-only'>Add</span>
          </button>  
        </div>
        <div className={
          acceptsBroadcast ? 'hidden' : 
          'flex w-full'}>
          <EnterableTextarea 
            className="flex-1 p-2 my-1 border border-gray-300 rounded h-8 resize-none overflow-hidden disabled:text-gray-300"
            value={chatOptions.input}
            onChange={chatOptions.handleInputChange}
            onEnter={() => {
              if (formRef.current)
                formRef.current.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
            }}
            onCompositeChange={onCompositeChange}
            placeholder={t('childInputPlaceholder')}
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
          {t('acceptsBroadCast')}
        </label>
      </form>
    </article>
    </>
  );
}
