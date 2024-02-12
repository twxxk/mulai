'use client';
 
import { ChatRequestOptions, Message } from 'ai';
import { ChatModel } from './chatModel'

export default function Chat({chatModel}:{chatModel:ChatModel}) 
{
  const handleChatSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // overwrite model
    console.log('requesting model=' + chatModel.model)
    const options:ChatRequestOptions = {options:{headers:{model: chatModel.model}}}

    e.preventDefault()
    chatModel.handleSubmit(e, options)
  }
  
  return (
    <div className="resize-x overflow-auto border border-solid flex flex-col w-full max-w-md py-24 mx-auto stretch">
      <div>Model: <strong>{chatModel.model}</strong></div>
      {chatModel.messages.map(m => (
        <div key={m.id} className="whitespace-pre-wrap">
          {m.role === 'user' ? 'User: ' 
          : m.role === 'assistant' ? 'AI: '
          : 'System: '}
          {m.content}
        </div>
      ))}
 
      <form onSubmit={handleChatSubmit} className='bottom-0 '>
        <input
          className="w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
          value={chatModel.input}
          placeholder="Say something..."
          onChange={chatModel.handleInputChange}
        />
      </form>
    </div>
  );
}