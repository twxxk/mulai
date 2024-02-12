import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';
// import does not work with google https://ai.google.dev/tutorials/node_quickstart
const { GoogleGenerativeAI } = require("@google/generative-ai");
import { GoogleGenerativeAIStream, Message } from 'ai';

// Create ai clients (they're edge friendly!)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, });
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

// Set the runtime to edge for best performance
export const runtime = 'edge';

const DEFAULT_MODEL = 'gpt-3.5-turbo'
const ALLOWED_MODELS: any = {
    'gpt-3.5-turbo': 'openai',
    'gpt-4-turbo-preview': 'openai',
    'gemini-pro': 'google',
}


// OpenAI
const openaiChatStream = async({model, messages}:{model:string, messages:any}):Promise<ReadableStream> => {
    // Ask OpenAI for a streaming chat completion given the prompt
    const response = await openai.chat.completions.create({
        model: model,
        stream: true,
        messages,
    })

    // Convert the response into a friendly text-stream
    const stream = OpenAIStream(response)
    return stream
}


// convert messages from the Vercel AI SDK Format to the format
// that is expected by the Google GenAI SDK
const buildGoogleGenAIPrompt = (messages: Message[]) => ({
    contents: messages
        .filter(message => message.role === 'user' || message.role === 'assistant')
        .map(message => ({
            role: message.role === 'user' ? 'user' : 'model',
            parts: [{ text: message.content }],
        })),
});

// Google Gemini
const googleChatStream = async({model, messages}:{model:string, messages:Message[]}):Promise<ReadableStream> => {
    const geminiStream = await genAI
        .getGenerativeModel({ model: model })
        .generateContentStream(buildGoogleGenAIPrompt(messages))

    // Convert the response into a friendly text-stream
    const stream = GoogleGenerativeAIStream(geminiStream)
    return stream
}

export async function POST(req: Request) {
    const { messages } = await req.json();
    let model = req.headers.get('Model') ?? ''
    let vendor = ALLOWED_MODELS[model]

    if (!vendor) {
        console.error('model not found=' + model)
        model = DEFAULT_MODEL
        vendor = ALLOWED_MODELS[model]
    }
    console.log('model=' + model)

    if (vendor == 'openai') {
        const stream = await openaiChatStream({model, messages})
        return new StreamingTextResponse(stream)
    }
    else 
    {
        const stream = await googleChatStream({model, messages})
        return new StreamingTextResponse(stream)
    }
}