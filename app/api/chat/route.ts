import OpenAI from 'openai';
import { StreamingTextResponse, Message } from 'ai';
import { OpenAIStream, GoogleGenerativeAIStream, CohereStream } from 'ai';
// import does not work with google https://ai.google.dev/tutorials/node_quickstart
const { GoogleGenerativeAI } = require("@google/generative-ai");
import { ModelLabel } from '@/app/common';

// Create ai clients (they're edge friendly!)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, });
const google = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
const fireworks = new OpenAI({
    apiKey: process.env.FIREWORKS_API_KEY || '',
    baseURL: 'https://api.fireworks.ai/inference/v1',
});

// Set the runtime to edge for best performance
export const runtime = 'edge';

type ModelVendor = 'openai' | 'google' | 'fireworks.ai'

// # openai https://openai.com/pricing#language-models
// gpt-4-0125-preview (turbo) in $0.01/1K tokens, out $0.03/1K tokens 
// gpt-3.5-turbo-0125         in $0.0005/1K tokens, out $0.0015/1K tokens
// # google = free (up to 60queries/min) https://ai.google.dev/pricing
// # fireworks.ai = free (some models) in dev 10q/min. devpro $1/1M tokens, 100q/min https://readme.fireworks.ai/page/pricing
// model list: https://fireworks.ai/models
const DEFAULT_MODEL_LABEL:ModelLabel = 'Gemini Pro' // fall back free model.
const modelDictionary:{[key in ModelLabel]:{vendor:ModelVendor, model:string}} = {
    'GPT-3.5':                  {vendor: 'openai', model: 'gpt-3.5-turbo'},
    'GPT-4':                    {vendor: 'openai', model: 'gpt-4-turbo-preview'},
    'Gemini Pro':               {vendor: 'google', model: 'gemini-pro'},
    // # japanese
    'Japanese StableLM Instruct Beta 70B': {vendor: 'fireworks.ai', model: 'accounts/stability/models/japanese-stablelm-instruct-beta-70b'},
    'Japanese Stable LM Instruct Gamma 7B': {vendor: 'fireworks.ai', model: 'accounts/stability/models/japanese-stablelm-instruct-gamma-7b'},
    'FireLLaVA 13B': {vendor: 'fireworks.ai', model: 'accounts/fireworks/models/firellava-13b'},
    // 'Qwen 14B Chat':             {vendor: 'fireworks.ai', model: 'accounts/fireworks/models/qwen-14b-chat'},
    // 'Qwen 72B Chat':             {vendor: 'fireworks.ai', model: 'accounts/fireworks/models/qwen-72b-chat'},
    // # non-japanese output
    // 'Mixtral MoE 8x7B Instruct': {vendor: 'fireworks.ai', model: 'accounts/fireworks/models/mixtral-8x7b-instruct'},
    // 'Llama 2 7B Chat':          {vendor: 'fireworks.ai', model: 'accounts/fireworks/models/llama-v2-7b-chat'},
    // 'Llama 2 13B Chat':         {vendor: 'fireworks.ai', model: 'accounts/fireworks/models/llama-v2-13b-chat'},
    // 'Llama 2 70B Chat':         {vendor: 'fireworks.ai', model: 'accounts/fireworks/models/llama-v2-70b-chat'},
}

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
        const modelLabel = req.headers.get('Model') ?? ''

        let {vendor, model} = modelDictionary[modelLabel as ModelLabel]
    
        if (!vendor) {
            console.error('model not found=' + modelLabel)
            let {vendor, model} = modelDictionary[DEFAULT_MODEL_LABEL]
        }
        // console.log('model=' + model)
    
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