'use client';
 
import { ChatRequestOptions, Message } from 'ai';

export default function Chat({initialModel, messages, input, handleInputChange, handleSubmit}:{
  initialModel: string,
  messages:Message[],
  input:string,
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => void,
  handleSubmit: (e: React.FormEvent<HTMLFormElement>, chatRequestOptions?: ChatRequestOptions) => void;
}) 
{
  let model = initialModel

  const handleChatSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // overwrite model
    const options:ChatRequestOptions = {options:{headers:{model: model}}}

    e.preventDefault()
    handleSubmit(e, options)
  }
  
  return (
    <div className="resize-x overflow-auto border border-solid flex flex-col w-full max-w-md py-24 mx-auto stretch">
      <div>Model: {model}</div>
      {messages.map(m => (
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
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}