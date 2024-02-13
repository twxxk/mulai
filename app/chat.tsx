'use client';
 
import { ChatRequestOptions, Message } from 'ai';
import { ChatModel } from './chatModel'
import { RefreshCwIcon, Minimize2Icon, Maximize2Icon } from 'lucide-react';
import { useState } from 'react';

export default function Chat({chatModel}:{chatModel:ChatModel}) 
{
  const [styles, setStyles] = useState({})

  const handleChatSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // overwrite model
    console.log('requesting model=' + chatModel.model)
    const options:ChatRequestOptions = {options:{headers:{model: chatModel.model}}}

    e.preventDefault()
    chatModel.handleSubmit(e, options)
  }

  const handleReload = () => {
    chatModel.reload()
  }

  const handleUpdatePaneSize = () => updatePaneSize(false)
  // const handleMaxmizePaneSize = () => 

  const updatePaneSize = (forceMinimize:boolean) => {
    const minimizedStyles = {width: '40em'}

    if (forceMinimize) {
      setStyles(minimizedStyles)
      return
    }

    // console.log(styles)
    if (minimizedStyles.width !== (styles as any)?.width)
      setStyles(minimizedStyles)
    else
      setStyles({})
  }

  return (<>
    <div style={styles} className="border border-solid flex flex-col w-full p-1 mx-1 h-full">
      <div className='px-3'>Model: <strong>{chatModel.model}</strong></div>
      <div className='flex-1 overflow-auto'>
      {chatModel.messages.map(m => (
        <div key={m.id} className={
          "whitespace-pre-wrap flex max-w-80 md:max-w-xl flex-col gap-2 rounded-sm px-2 py-1 m-1 text-sm " + 
          (m.role === "user"
            ? "bg-slate-50"
            : m.role === "assistant"
            ? ""
            : process.env.NODE_ENV !== 'development'
            ? "hidden" // system
            : "bg-gray-100 text-gray-400"
        )}>
          <span className='font-bold'>{m.role === 'user' ? 'User: ' 
          : m.role === 'assistant' ? 'AI: '
          : 'System: '}</span>
          {m.content}
        </div>
      ))}
      </div>
 
      <form onSubmit={handleChatSubmit} className='bottom-0 bg-slate-50 p-2 rounded-sm'>
        <div className='flex flex-row w-full'>
          <div className="flex-1">
            <strong>{chatModel.model}</strong>
          </div>
          {/* 
          <button className="mt-1 ml-1 disabled:text-gray-300 enabled:text-teal-900 enabled:hover:text-teal-700 enabled:active:text-teal-600" onClick={handleUpdatePaneSize}>
            <Minimize2Icon className="h-4 w-4" />
            <span className="sr-only">Minimize</span>
          </button>
          <button className="ml-1 disabled:text-gray-300 enabled:text-teal-900 enabled:hover:text-teal-700 enabled:active:text-teal-600" onClick={handleMaxmizePaneSize}>
            <Maximize2Icon className="h-4 w-4" />
            <span className="sr-only">Maximize</span>
          </button> */}
        </div>
        <div className='flex w-full'>
          <input
            className="flex-1 p-2 mt-auto mb-0 border border-gray-300 rounded"
            value={chatModel.input}
            placeholder="Say something to this model..."
            onChange={chatModel.handleInputChange}
          />
          <button className="ml-1 disabled:text-gray-300 enabled:text-teal-900 enabled:hover:text-teal-700 enabled:active:text-teal-600" 
            onClick={handleReload} disabled={chatModel.isLoading || chatModel.messages.length < 2}>
            <RefreshCwIcon className="h-4 w-4" />
            <span className="sr-only">Reload</span>
          </button>
        </div>
        <label>
          <input type="checkbox" className='mt-1 mr-1'
            checked={chatModel.isEnabled}
            onChange={() => chatModel.setIsEnabled(!chatModel.isEnabled)}
          />
          Accepts Broadcast</label>
      </form>
    </div>
    </>
  );
}