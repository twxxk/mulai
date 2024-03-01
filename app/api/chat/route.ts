import { StreamingTextResponse, Message } from 'ai';
import { OpenAIStream, GoogleGenerativeAIStream, CohereStream, AWSBedrockAnthropicStream, HuggingFaceStream } from 'ai';
import { experimental_buildOpenAssistantPrompt, experimental_buildAnthropicPrompt } from 'ai/prompts';
import OpenAI from 'openai';
// import does not work with google https://ai.google.dev/tutorials/node_quickstart
const { GoogleGenerativeAI } = require("@google/generative-ai");
import { HfInference } from '@huggingface/inference';
import { BedrockRuntimeClient, InvokeModelWithResponseStreamCommand } from '@aws-sdk/client-bedrock-runtime';
import { DEFAULT_MODEL, ModelVendor, getModelByValue, ModelValue } from '@/app/lib/common';
// Note: There are no types for the Mistral API client yet.
// @ts-ignore
import MistralClient from '@mistralai/mistralai';
import { ChatCompletionChunk } from 'openai/resources/index.mjs';

// Create ai clients (they're edge friendly!)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, });
const google = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
const fireworks = new OpenAI({
    apiKey: process.env.FIREWORKS_API_KEY || '',
    baseURL: 'https://api.fireworks.ai/inference/v1',
});
const Hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
const bedrockClient = new BedrockRuntimeClient({
    region: process.env.AWS_REGION ?? 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
    },
});
const groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY || '',
    baseURL: 'https://api.groq.com/openai/v1',
})
const mistral = new MistralClient(process.env.MISTRAL_API_KEY || '');

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
        max_tokens: 4096, // GPT-4 Vision responds tens of chars only if no max_tokens is given.
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
const fireworksChatStream:ChatStreamFunction = async ({model, messages}) => {
    // Ask Fireworks for a streaming chat completion using Llama 2 70b model
    // @see https://app.fireworks.ai/models/fireworks/llama-v2-70b-chat
    const response = await fireworks.chat.completions.create({
        model,
        stream: true,
        max_tokens: 4096,
        messages,
    });

    const stream = OpenAIStream(response);
    return stream    
}

const awsAnthropicChatStream:ChatStreamFunction = async ({model, messages})=>{
    // @see https://sdk.vercel.ai/docs/guides/providers/aws-bedrock
    // Ask Claude for a streaming chat completion given the prompt
    const bedrockResponse = await bedrockClient.send(
        new InvokeModelWithResponseStreamCommand({
            modelId: model,
            contentType: 'application/json',
            accept: 'application/json',
            body: JSON.stringify({
            prompt: experimental_buildAnthropicPrompt(messages),
            max_tokens_to_sample: 4000, // https://docs.aws.amazon.com/ja_jp/bedrock/latest/userguide/model-parameters-claude.html
            }),
        }),
    );
 
    const stream = AWSBedrockAnthropicStream(bedrockResponse);
    return stream    
}

const groqChatStream:ChatStreamFunction = async ({model, messages})=>{
    // @see https://docs.api.groq.com/md/openai.oas.html
    const response = await groq.chat.completions.create({
        model,
        stream: true,
        messages,
    });

    const stream = OpenAIStream(response);
    return stream    
}

const mistralChatStream:ChatStreamFunction = async ({model, messages}) => {
    // @see https://sdk.vercel.ai/docs/guides/providers/mistral
    const chatStream = await mistral.chatStream({
      model: model,
      messages,
    });
    const asyncIterable = chatStream as AsyncIterable<ChatCompletionChunk>;

    const stream = OpenAIStream(asyncIterable);    
    return stream
}

const huggingFaceStream:ChatStreamFunction = async ({model, messages}) => {
    const response = Hf.textGenerationStream({
        model: model,
        inputs: experimental_buildOpenAssistantPrompt(messages),
        parameters: {
          // @ts-ignore (this is a valid parameter specifically in OpenAssistant models)
          typical_p: 0.2,
          repetition_penalty: 1,
          return_full_text: false,
        },
      });
     
    // Convert the response into a friendly text-stream
    const stream = HuggingFaceStream(response);
    return stream
}

// Build a prompt from the messages
function buildCohereGenAIPrompt(messages: { content: string; role: 'system' | 'user' | 'assistant' }[]) {
  return (
    messages
      .map(({ content, role }) => {
        if (role === 'user') {
          return `Human: ${content}`;
        } else {
          return `Assistant: ${content}`;
        }
      })
      .join('\n\n') + 'Assistant:'
  );
}

const cohereChatStream:ChatStreamFunction = async ({model, messages}) => {
  // You need version https://docs.cohere.com/reference/versioning
  const response = await fetch('https://api.cohere.ai/generate', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.COHERE_API_KEY}`,
      'Cohere-Version': '2022-12-06',
    },
    body: JSON.stringify({
      model: model,
      prompt: buildCohereGenAIPrompt(messages),
      return_likelihoods: "NONE",
    //   max_tokens: 200,
      temperature: 0.9,
      top_p: 1,
      stream: true,
    }),
  })
  
    // const result = await response.json() // when stream: false
    // const stream = stringToReadableStream(result.generations[0].text.substring(0))

    const stream = CohereStream(response);
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
        'HuggingFace': huggingFaceStream,
        'groq': groqChatStream,
        'cohere': cohereChatStream,
        'aws': awsAnthropicChatStream,
        'mistral': mistralChatStream,
    }
    return vendorMap[vendor as string]
}

export async function POST(req: Request) {
    try {
        const { messages, data } = await req.json();
        let modelValue = req.headers.get('Model') ?? ''

        // get vendor from model (verifying model)       
        let modelData = getModelByValue(modelValue as ModelValue)
        if (!modelData) {
            console.error('model not found=' + modelValue);
            modelData = DEFAULT_MODEL
        }
        console.log('model:', modelValue, ', vendor:', modelData.vendor, ', sdkModel:', modelData.sdkModelValue)

        let m:any
        if (data?.imageUrl) {
            // https://sdk.vercel.ai/docs/guides/providers/openai#guide-using-images-with-gpt-4-vision-and-usechat
            // https://readme.fireworks.ai/docs/querying-vision-language-models
            const initialMessages = messages.slice(0, -1);
            const currentMessage = messages[messages.length - 1];        
            m = [
                ...initialMessages,
                {
                    ...currentMessage,
                    content: [
                        { type: 'text', text: currentMessage.content },
                        { type: 'image_url', image_url: { url: data?.imageUrl } },
                    ]
                }
            ]
        } else {
            m = messages
        }
        console.log(m)

        const responseStreamGenerator = chatStreamFactory(modelData.vendor)
        const stream = await responseStreamGenerator({model:modelData.sdkModelValue, messages: m})

        return new StreamingTextResponse(stream)
    } catch (e:any) {
        // any network error etc
        // throw e; // when you would like to check the details
        console.error(e.status, e.toString(), e)
        const stream = stringToReadableStream(e.toString())
        return new StreamingTextResponse(stream)
    }
}