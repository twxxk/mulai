'use client';
 
import { ChatRequestOptions } from 'ai';
import { ChatModel } from './chatModel'
import { RefreshCwIcon, Minimize2Icon, Maximize2Icon, SendIcon } from 'lucide-react';
import { useState } from 'react';
const Markdown = require('react-markdown-it')

export default function Chat({chatModel, index, updatePaneSize}:{
  chatModel:ChatModel, 
  index:number, 
  updatePaneSize:(index:number, size:string)=>void,
}) 
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

  const handleMinimizePaneSize = () => {
    updatePaneSize(index, "minimize")
  }

  const handleMaxmizePaneSize = () => {
    updatePaneSize(index, "maximize")
  }

  return (<>
    <div style={styles} className="flex flex-col w-full pt-2 h-full">
      <div className='px-3'>Model: <strong>{chatModel.model}</strong></div>
      <div id={'chatHistory' + index} className='flex-1 overflow-y-auto w-full'>
      {chatModel.messages.map(m => (
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
 
      <form onSubmit={handleChatSubmit} className='bottom-0 bg-slate-50 px-2 py-1 rounded-sm'>
        <div className='flex flex-row w-full'>
          <div className="flex-1">
            <strong>{chatModel.model}</strong>
          </div>
          <button className="mt-1 ml-1 disabled:text-gray-300 enabled:text-slate-700 enabled:hover:text-teal-700 enabled:active:text-teal-600" onClick={handleMinimizePaneSize}>
            <Minimize2Icon className="h-4 w-4" />
            <span className="sr-only">Minimize</span>
          </button>
          <button className="ml-1 disabled:text-gray-300 enabled:text-slate-900 enabled:hover:text-teal-700 enabled:active:text-teal-600" onClick={handleMaxmizePaneSize}>
            <Maximize2Icon className="h-4 w-4" />
            <span className="sr-only">Maximize</span>
          </button>
        </div>
        <div className='flex w-full'>
          <input
            className="flex-1 p-2 my-1 border border-gray-300 rounded"
            value={chatModel.input}
            placeholder="Say something to this model..."
            onChange={chatModel.handleInputChange}
          />
          {/* disabled is useful to stop submitting with enter */}
          <button type="submit" 
            className='ml-1 disabled:text-gray-300 enabled:text-teal-900 enabled:hover:text-teal-700 enabled:active:text-teal-600' 
            disabled={chatModel.input.length === 0 || chatModel.isLoading}>
            <SendIcon className="h-5 w-5" />
            <span className="sr-only">Send</span>
          </button>
          <button className="ml-1 disabled:text-gray-300 enabled:text-teal-900 enabled:hover:text-teal-700 enabled:active:text-teal-600" 
            onClick={handleReload} disabled={chatModel.isLoading || chatModel.messages.length < 2}>
            <RefreshCwIcon className="h-4 w-4" />
            <span className="sr-only">Reload</span>
          </button>
        </div>
        <label>
          <input type="checkbox" className='mr-1'
            checked={chatModel.isEnabled}
            onChange={() => chatModel.setIsEnabled(!chatModel.isEnabled)}
          />
          Accepts Broadcast</label>
      </form>
    </div>
    </>
  );
}