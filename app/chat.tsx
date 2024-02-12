'use client';
 
import { ChatRequestOptions, Message } from 'ai';
import { ChatModel } from './chatModel'
import { RefreshCwIcon } from 'lucide-react';

export default function Chat({chatModel}:{chatModel:ChatModel}) 
{
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
  
  return (<>
    <div className="resize-x overflow-auto border border-solid flex flex-col w-full p-1 mx-1 stretch flex-grow">
      <div className=''>Model: <strong>{chatModel.model}</strong></div>
      <div className='flex-grow'>
      {chatModel.messages.map(m => (
        <div key={m.id} className="whitespace-pre-wrap py-1">
          <span className='font-bold'>{m.role === 'user' ? 'User: ' 
          : m.role === 'assistant' ? 'AI: '
          : 'System: '}</span>
          {m.content}
        </div>
      ))}
      </div>
 
      <form onSubmit={handleChatSubmit} className='bottom-0 bg-slate-50 p-2 rounded-sm'>
        <div className=''><strong>{chatModel.model}</strong></div>
        <div className='flex w-full'>
          <input
            className="flex-1 p-2 mt-auto mb-0 border border-gray-300 rounded"
            value={chatModel.input}
            placeholder="Say something to this model..."
            onChange={chatModel.handleInputChange}
          />
          <button className="ml-1" onClick={handleReload} disabled={chatModel.isLoading && chatModel.messages.length >= 2}>
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