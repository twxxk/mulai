import OpenAI from 'openai';
import { StreamingTextResponse, Message } from 'ai';
import { OpenAIStream, GoogleGenerativeAIStream, CohereStream } from 'ai';
// import does not work with google https://ai.google.dev/tutorials/node_quickstart
const { GoogleGenerativeAI } = require("@google/generative-ai");
import { DEFAULT_MODEL, ModelVendor, modelList } from '@/app/lib/common';

// Create ai clients (they're edge friendly!)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, });
const google = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
const fireworks = new OpenAI({
    apiKey: process.env.FIREWORKS_API_KEY || '',
    baseURL: 'https://api.fireworks.ai/inference/v1',
});

// Set the runtime to edge for best performance
export const runtime = 'edge';


interface ChatStreamFunction {
    ({model, messages}: {model: string, messages: any}): Promise<ReadableStream>;
}

function stringToReadableStream(str:string):ReadableStream {
    return new ReadableStream({
        start(controller) {
            controller.enqueue(new TextEncoder().encode(str));
            controller.close();
        }
    });
}

// OpenAI
// https://sdk.vercel.ai/docs/guides/providers/openai
const openaiChatStream:ChatStreamFunction = async({model, messages}) => {
    // Ask OpenAI for a streaming chat completion given the prompt
    const response = await openai.chat.completions.create({
        model,
        stream: true,
        messages,
    })

    // Convert the response into a friendly text-stream
    const stream = OpenAIStream(response)
    return stream
}


// Google Gemini
// https://sdk.vercel.ai/docs/guides/providers/google
const googleChatStream:ChatStreamFunction = async({model, messages}) => {
    const geminiStream = await google
        .getGenerativeModel({ model })
        .generateContentStream(buildGoogleGenAIPrompt(messages))

    // Convert the response into a friendly text-stream
    const stream = GoogleGenerativeAIStream(geminiStream)
    return stream

    // convert messages from the Vercel AI SDK Format to the format
    // that is expected by the Google GenAI SDK
    function buildGoogleGenAIPrompt(messages: Message[]) {
        return ({
            contents: messages
                .filter(message => message.role === 'user' || message.role === 'assistant')
                .map(message => ({
                    role: message.role === 'user' ? 'user' : 'model',
                    parts: [{ text: message.content }],
                })),
        });
    }
}

// fireworks.ai
const fireworksChatStream:ChatStreamFunction = async ({ model, messages }) => {
    // Ask Fireworks for a streaming chat completion using Llama 2 70b model
    // @see https://app.fireworks.ai/models/fireworks/llama-v2-70b-chat
    const response = await fireworks.chat.completions.create({
        model,
        stream: true,
        messages,
    });

    const stream = OpenAIStream(response);
    return stream    
}

// factory method
// might be returned undefined
function chatStreamFactory(vendor: ModelVendor):ChatStreamFunction {
    // key is actually ModelVendor
    const vendorMap:{[key:string]:ChatStreamFunction} = {
        'openai': openaiChatStream,
        'google': googleChatStream,
        'fireworks.ai': fireworksChatStream,
    }
    return vendorMap[vendor as string]
}

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();
        let model = req.headers.get('Model') ?? ''

        // get vendor from model (verifying model)       
        let vendor = modelList.find((value) => value.model === model)?.vendor
        if (!vendor) {
            console.error('model not found=' + model);
            ({vendor, model} = DEFAULT_MODEL)
        }
        console.log('model=' + model, ', vendor=', vendor)
    
        const responseStreamGenerator = chatStreamFactory(vendor)
        const stream = await responseStreamGenerator({model, messages})
        return new StreamingTextResponse(stream)
    } catch (e:any) {
        // any network error etc
        // throw e; // when you would like to check the details
        console.error(e.status, e.toString(), e)
        const stream = stringToReadableStream(e.toString())
        return new StreamingTextResponse(stream)
    }
}