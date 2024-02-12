import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';

// Create an OpenAI API client (that's edge friendly!)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
 
// Set the runtime to edge for best performance
export const runtime = 'edge';
const ALLOWED_MODELS = ['gpt-3.5-turbo', 'gpt-4-turbo-preview']
 
export async function POST(req: Request) {
  const { messages } = await req.json();
  const givenModel = req.headers.get('Model') ?? ''

  if (ALLOWED_MODELS.indexOf(givenModel) < 0) {
    console.error('model not found=' + givenModel)
  }

  const model = ALLOWED_MODELS.indexOf(givenModel) >= 0 ? givenModel : ALLOWED_MODELS[0]
  console.log('model=' + model)

  // Ask OpenAI for a streaming chat completion given the prompt
  const response = await openai.chat.completions.create({
    model: model,
    stream: true,
    messages,
  });
 
  // Convert the response into a friendly text-stream
  const stream = OpenAIStream(response);
  // Respond with the stream
  return new StreamingTextResponse(stream);
}