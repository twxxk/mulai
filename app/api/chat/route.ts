import { StreamingTextResponse, Message, experimental_streamText, ExperimentalMessage } from 'ai';
import { OpenAIStream, CohereStream, AWSBedrockAnthropicStream, HuggingFaceStream } from 'ai';
import { experimental_buildOpenAssistantPrompt, experimental_buildAnthropicPrompt } from 'ai/prompts';
import OpenAI from 'openai';
import { HfInference } from '@huggingface/inference';
import { BedrockRuntimeClient, InvokeModelWithResponseStreamCommand } from '@aws-sdk/client-bedrock-runtime';
import { DEFAULT_MODEL, getModelByValue, ModelValue, ChatModel } from '@/app/lib/ai-model';
import { ImageGenerateParams } from 'openai/resources/index.mjs';
import { Google } from 'ai/google';
import { Mistral } from 'ai/mistral';
import Anthropic from '@anthropic-ai/sdk';
import { AnthropicStream } from 'ai';
import { MessageParam } from '@anthropic-ai/sdk/resources/messages.mjs';

// Create ai clients (they're edge friendly!)
const openai = new OpenAI({ 
    apiKey: process.env.OPENAI_API_KEY, 
});
const fireworks = new OpenAI({
    apiKey: process.env.FIREWORKS_API_KEY || '',
    baseURL: 'https://api.fireworks.ai/inference/v1',
});
const groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY || '',
    baseURL: 'https://api.groq.com/openai/v1',
});
const perplexity  = new OpenAI({
    apiKey: process.env.PERPLEXITY_API_KEY || '',
    baseURL: 'https://api.perplexity.ai/',
});
const Hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
const bedrockClient = new BedrockRuntimeClient({
    region: process.env.AWS_REGION ?? 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
    },
});
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || '',
});
const google = new Google({ apiKey: process.env.GOOGLE_API_KEY || '' });
const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY || ''});

// Set the runtime to edge for best performance
export const runtime = 'edge';


interface ChatStreamFunction {
    ({model, messages}: {model: ChatModel, messages: Message[]}): Promise<ReadableStream>;
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
    const result = await experimental_streamText({
        model: google.generativeAI('models/' + model.sdkModelValue),
        messages: messages as ExperimentalMessage[],
    });
    return result.toAIStream();
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

const perplexityChatStream:ChatStreamFunction = async ({model, messages}) => {
    // @see https://sdk.vercel.ai/docs/guides/providers/perplexity
    const response = await perplexity.chat.completions.create({
        model: model.sdkModelValue,
        stream: true,
        messages: messages as any,
    });

    const stream = OpenAIStream(response);
    return stream    
}

const mistralChatStream:ChatStreamFunction = async ({model, messages}) => {
    const result = await experimental_streamText({
        model: mistral.chat(model.sdkModelValue),
        messages: messages as ExperimentalMessage[],
    });
    return result.toAIStream();
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

    const arrayBuffer = await blob.arrayBuffer();
    const base64 = abToBase64(arrayBuffer)
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

function abToBase64(arrayBuffer:ArrayBuffer) {
    // const bytes = new Uint8Array(arrayBuffer);
    // // TextDecoder does not work for binary
    // let chars = new Array(bytes.length);
    // for (let i = 0; i < bytes.length; i++) {
    //     chars[i] = String.fromCharCode(bytes[i]);
    // }
    // const base64String = btoa(chars.join(''));

    // Edge Runtime friendly https://vercel.com/docs/functions/runtimes/edge-runtime
    const base64String = Buffer.from(arrayBuffer).toString('base64');
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

const anthropicChatStream:ChatStreamFunction = async ({model, messages}) => {
  // Ask Claude for a streaming chat completion given the prompt
  const response = await anthropic.messages.create({
    messages: messages as MessageParam[],
    model: model.sdkModelValue,
    stream: true,
    max_tokens: model.maxTokens ?? 4096,
  });
 
  // Convert the response into a friendly text-stream
  const stream = AnthropicStream(response);
  return stream    
}

// factory method
// might be returned undefined
function chatStreamFactory(model: ChatModel):ChatStreamFunction {
    // key is actually ModelProvider
    const providerMap:{[key:string]:ChatStreamFunction} = {
        'openai': openaiChatStream,
        'openai-image': openaiImageStream,
        'google': googleChatStream,
        'fireworksai': fireworksChatStream,
        'fireworksai-image': fireworksImageStream,
        'huggingface': huggingFaceStream,
        'huggingface-image': huggingFaceImageStream,
        'groq': groqChatStream,
        'cohere': cohereChatStream,
        'aws': awsAnthropicChatStream,
        'mistral': mistralChatStream,
        'perplexity': perplexityChatStream,
        // 'langchain': langchainChatStream,
        'anthropic': anthropicChatStream,
    }
    const stream = providerMap[model.provider as string]
    if (!stream) {
        console.error('unexpected model', model)
        throw new Error('unexpected request')
    }
    return stream
}

export async function POST(req: Request) {
    const { messages, data } = await req.json();
    try {
        let modelValue = req.headers.get('Model') ?? ''

        let modelData = getModelByValue(modelValue as ModelValue)
        if (!modelData) {
            console.error('model not found=' + modelValue);
            modelData = DEFAULT_MODEL
        }
        console.log('model:', modelValue, ', provider:', modelData.provider, ', sdkModel:', modelData.sdkModelValue)

        let m:any
        if (data?.imageUrl) {
            let image_content:object = { type: 'image', image: new URL(data!.imageUrl) } 
            if (modelData.provider === 'openai') {
                image_content = { type: 'image_url', image_url: { url: data!.imageUrl } }
            } else if (modelData.provider === 'anthropic') {
                const {image_media_type, image_data} = await getExternalImage(data!.imageUrl)
                image_content = {
                    "type": "image",
                    "source": {
                        "type": "base64",
                        "media_type": image_media_type,
                        "data": image_data,
                    },
                }        
            }
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
                        ...[image_content],
                    ]
                }
            ]
        } else {
            m = messages
        }
        // console.log(m)

        const responseStreamGenerator = chatStreamFactory(modelData)
        const stream = await responseStreamGenerator({model:modelData, messages: m})

        // return new Response('0: "Dummy Error"', {
        //     statusText: "dummy error",
        //     headers: { 'original-status': "403" },
        // });
        return new StreamingTextResponse(stream)
    } catch (err:any) {
        // Groq sometimes return html errors with 403 via cloudflare.
        // https://sdk.vercel.ai/docs/guides/providers/openai#guide-handling-errors
        // https://github.com/openai/openai-node?tab=readme-ov-file#handling-errors
        // https://github.com/groq/groq-typescript
        const errorMessage = err?.message || err?.statusText
        console.warn(err.status, errorMessage, err?.error)
        // if (err instanceof OpenAI.APIError) {
        //     console.debug(err.error)
        // }
        console.debug(messages, err.toString())
      
        // throw e; // when you would like to check the details
        const stream = stringToReadableStream(`0: "${errorMessage}"`)
        return new StreamingTextResponse(stream, {
            // status is overwritten by StreamingTextResponse. It could be good to generate contents to the user
            // status: err.status,
            headers: { 'original-status': err.status },
            statusText: err.statusText,
        })
    }
}

async function getExternalImage(image_url: string):Promise<{image_media_type: string, image_data: string}> {
    // https://docs.anthropic.com/claude/reference/messages-examples#vision
    const claude_supported_media_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

    // handle base64 data url
    const matched = image_url.match(/^data:(.*);base64,(.*)$/)
    if (matched) {
        const [_, matched_media_type, matched_data] = matched
        console.log('matched', matched_media_type)
        if (claude_supported_media_types.indexOf(matched_media_type) < 0) {
            console.debug('media not supported')
            throw new Error('Unsupported Media')
        }
        return {image_media_type: matched_media_type, image_data: matched_data}    
    }

    if (!image_url.match(/^https?:\/\//)) {
        console.debug('unknown url format', image_url)
        throw new Error('Unsupported URL')
    }

    const res = await fetch(image_url)
    // const b = (await r.blob()).type

    const image_media_type = res.headers.get('content-type') ?? ''
    console.log(image_media_type)
    
    if (claude_supported_media_types.indexOf(image_media_type) < 0) {
        console.debug('media not supported')
        throw new Error('Unsupported Media')
    }
    const image_array_buffer = await res.arrayBuffer();
    const image_data = abToBase64(image_array_buffer)

    return {image_media_type, image_data}    
}
