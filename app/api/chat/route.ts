import { StreamingTextResponse, Message } from 'ai';
import { OpenAIStream, GoogleGenerativeAIStream, CohereStream, AWSBedrockAnthropicStream, HuggingFaceStream } from 'ai';
import { experimental_buildOpenAssistantPrompt, experimental_buildAnthropicPrompt, ChatCompletionMessageParam } from 'ai/prompts';
import OpenAI from 'openai';
// import does not work with google https://ai.google.dev/tutorials/node_quickstart
const { GoogleGenerativeAI } = require("@google/generative-ai");
import { HfInference } from '@huggingface/inference';
import { BedrockRuntimeClient, InvokeModelWithResponseStreamCommand } from '@aws-sdk/client-bedrock-runtime';
import { DEFAULT_MODEL, getModelByValue, ModelValue, ChatModelData } from '@/app/lib/common';
// Note: There are no types for the Mistral API client yet.
// @ts-ignore
import MistralClient from '@mistralai/mistralai';
import { ChatCompletionChunk, ImageGenerateParams } from 'openai/resources/index.mjs';

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
    ({model, messages}: {model: ChatModelData, messages: Message[]}): Promise<ReadableStream>;
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
    const defaultParams = {
        model: model.sdkModelValue,
        stream: true,
        messages,
    }
    const params = model.maxTokens ? {...defaultParams, max_tokens: model.maxTokens} : defaultParams
    const response = await openai.chat.completions.create(params as any)

    // Convert the response into a friendly text-stream
    const stream = OpenAIStream(response as any)
    return stream
}

const openaiImageStream:ChatStreamFunction = async({model, messages}) => {
    const prompt = messages[messages.length - 1].content

    const params:ImageGenerateParams = {
        prompt,
        model: model.sdkModelValue,
        n: 1, // 5/min for free tier
        response_format: 'url',
        // size: '256x256', // for dall-e-2
        // size: '1024x1024' // for dall-e-3
    }
    const response = await openai.images.generate(params)
    // console.log(response.data) // [{url:string}, ...]

    const responseMarkdown = response.data.map((datum) => 
        datum.url ? imageMarkdown(datum.url as string, prompt) : ''
    ).join('\n')

    const stream = stringToReadableStream(responseMarkdown)
    return stream    
}

// Google Gemini
// https://sdk.vercel.ai/docs/guides/providers/google
const googleChatStream:ChatStreamFunction = async({model, messages}) => {
    const prompts = buildGoogleGenAIPrompt(messages)
    const geminiStream = await google
        .getGenerativeModel({ model: model.sdkModelValue })
        .generateContentStream(prompts)

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
        model: model.sdkModelValue,
        stream: true,
        max_tokens: 4096,
        messages: messages as any,
    });

    const stream = OpenAIStream(response);
    return stream    
}

// FIXME Got 404 Model not found 
// Fireworks.ai image generation might not be compatible with OpenAI
// https://readme.fireworks.ai/docs/querying-vision-language-models#can-firellava-generate-images
const fireworksImageStream:ChatStreamFunction = async ({model, messages}) => {
    const prompt = messages[messages.length - 1].content

    let params:ImageGenerateParams = {
        prompt,
        model: model.sdkModelValue,
        response_format: 'url',
    }
    // console.log('params', params)
    const response = await fireworks.images.generate(params)

    const responseMarkdown = response.data.map((datum) => 
        datum.url ? imageMarkdown(datum.url as string, prompt) : ''
    ).join('\n')

    const stream = stringToReadableStream(responseMarkdown)
    return stream    
}

const awsAnthropicChatStream:ChatStreamFunction = async ({model, messages})=>{
    // @see https://sdk.vercel.ai/docs/guides/providers/aws-bedrock
    // Ask Claude for a streaming chat completion given the prompt
    const bedrockResponse = await bedrockClient.send(
        new InvokeModelWithResponseStreamCommand({
            modelId: model.sdkModelValue,
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
        model: model.sdkModelValue,
        stream: true,
        messages: messages as any,
    });

    const stream = OpenAIStream(response);
    return stream    
}

const mistralChatStream:ChatStreamFunction = async ({model, messages}) => {
    // @see https://sdk.vercel.ai/docs/guides/providers/mistral
    const chatStream = await mistral.chatStream({
      model: model.sdkModelValue,
      messages,
    });
    const asyncIterable = chatStream as AsyncIterable<ChatCompletionChunk>;

    const stream = OpenAIStream(asyncIterable);    
    return stream
}

const huggingFaceStream:ChatStreamFunction = async ({model, messages}) => {
    const response = Hf.textGenerationStream({
        model: model.sdkModelValue,
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

const huggingFaceImageStream:ChatStreamFunction = async ({model, messages}) => {
    const prompt = messages[messages.length - 1].content

    const blob:Blob = await Hf.textToImage({
        inputs: prompt
    })
    // console.log(blob.type, blob.size, 'bytes')

    const base64 = await blobToBase64(blob)
    const url = `data:${blob.type};base64,` + base64

    const responseMarkdown = imageMarkdown(url, prompt)
    console.log(model.modelValue, ':', responseMarkdown.substring(0, 100), '...')

    return stringToReadableStream(responseMarkdown)
}

// <img /> is not supported (raw text is shown)
function imageMarkdown(url:string, prompt:string = 'Image') {
    // [] => (), " => '
    const escapedPrompt = prompt.replaceAll(/\[/g, "(").replaceAll(/\]/g, ")").replaceAll(/"/g, "'")
    const responseMarkdown = `![${escapedPrompt}](${url} "${escapedPrompt}")`
    return responseMarkdown
}

async function blobToBase64(blob:Blob) {
    const arrayBuffer = await blob.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let chars = new Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) {
        chars[i] = String.fromCharCode(bytes[i]);
    }
    const base64String = btoa(chars.join(''));
    return base64String;
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
      model: model.sdkModelValue,
      prompt: buildCohereGenAIPrompt(messages as any),
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
function chatStreamFactory(model: ChatModelData):ChatStreamFunction {
    // key is actually ModelVendor
    const vendorMap:{[key:string]:ChatStreamFunction} = {
        'openai': openaiChatStream,
        'openai-image': openaiImageStream,
        'google': googleChatStream,
        'fireworks.ai': fireworksChatStream,
        'fireworks.ai-image': fireworksImageStream,
        'HuggingFace': huggingFaceStream,
        'HuggingFace-image': huggingFaceImageStream,
        'groq': groqChatStream,
        'cohere': cohereChatStream,
        'aws': awsAnthropicChatStream,
        'mistral': mistralChatStream,
    }
    return vendorMap[model.vendor as string]
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
        // console.log(m)

        const responseStreamGenerator = chatStreamFactory(modelData)
        const stream = await responseStreamGenerator({model:modelData, messages: m})

        return new StreamingTextResponse(stream)
    } catch (e:any) {
        // any network error etc
        // throw e; // when you would like to check the details
        console.error(e.status, e.toString(), e)
        const stream = stringToReadableStream(e.toString())
        return new StreamingTextResponse(stream)
    }
}