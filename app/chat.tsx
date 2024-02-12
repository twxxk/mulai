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
 
      <form onSubmit={handleChatSubmit} className='bottom-0'>
        <input
          className="w-full p-2 mt-auto mb-0 border border-gray-300 rounded"
          value={chatModel.input}
          placeholder="Say something to this model..."
          onChange={chatModel.handleInputChange}
        />
        {/* <input type='checkbox' />停止 */}
      </form>
    </div>
    </>
  );
}