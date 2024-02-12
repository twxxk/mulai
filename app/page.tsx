'use client';
 
import { ChatRequestOptions } from 'ai';
import { useChat } from 'ai/react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();

  const handleChatSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const model = 'gpt-4-turbo-preview'
    const options:ChatRequestOptions = {options:{headers:{model: model}}}

    e.preventDefault()
    handleSubmit(e, options)
  }
  
  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {messages.map(m => (
        <div key={m.id} className="whitespace-pre-wrap">
          {m.role === 'user' ? 'User: ' : 'AI: '}
          {m.content}
        </div>
      ))}
 
      <form onSubmit={handleChatSubmit}>
        <input
          className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}