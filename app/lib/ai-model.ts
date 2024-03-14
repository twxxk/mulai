// AI models info
// called from edge and webapp

// # openai 
//   https://openai.com/pricing#language-models
//   https://platform.openai.com/docs/models/gpt-4-and-gpt-4-turbo
//   https://platform.openai.com/docs/guides/vision/calculating-costs
// # google
//   https://ai.google.dev/pricing
//   https://ai.google.dev/models/gemini
// # fireworks.ai
//   https://readme.fireworks.ai/page/pricing
//   https://fireworks.ai/models
//   fireworks.ai is free (some models) in dev 10q/min. devpro $1/1M tokens, 100q/min 
// # AWS Bedrock Anthropic Claude
//   https://aws.amazon.com/jp/bedrock/pricing/
// # Mistral
//   https://docs.mistral.ai/platform/endpoints/
// # Groq
//   https://console.groq.com/docs/models
// # Perplexity
//   https://docs.perplexity.ai/docs/model-cards
// # Anthropic
//   https://docs.anthropic.com/claude/docs/models-overview

export type ModelProvider = 'openai' | 'google' | 'fireworksai' | 'huggingface' | 'cohere' | 'aws' | 'mistral' | 'groq' | 'perplexity' | 'langchain' | 'anthropic'
    | 'openai-image' | 'huggingface-image' | 'fireworksai-image'
export const openAiCompatipleProviders:ModelProvider[] = ['openai', 'fireworksai', 'groq', 'perplexity'] as const

// Declare the internal type to avoid build errors
type ChatModel0 = {
    label: string,
    provider: ModelProvider,
    modelValue: string,
    sdkModelValue: string,
    qualityScore: number,
    japaneseScore: number,
    maxTokens?: number,
    doesToolSupport?: boolean,
}
// models will be displayed in this order
const allModels0:ChatModel0[] = [
    // fast. in $0.0005/1K tokens, out $0.0015/1K tokens
    {label: 'GPT-3.5', provider: 'openai', modelValue: 'gpt-3.5-turbo', sdkModelValue: 'gpt-3.5-turbo', qualityScore: 118/256*100, japaneseScore: 67, doesToolSupport: true,},
    // in $0.03/1K tokens, out $0.06/1K tokens
    {label: 'GPT-4', provider: 'openai', modelValue: 'gpt-4', sdkModelValue: 'gpt-4', qualityScore: 254/256*100, japaneseScore: 76, doesToolSupport: true,},
    // in $0.01/1K tokens, out $0.03/1K tokens 
    {label: 'GPT-4 Turbo', provider: 'openai', modelValue: 'gpt-4-turbo-preview', sdkModelValue: 'gpt-4-turbo-preview', qualityScore: 253/256*100, japaneseScore: 77, doesToolSupport: true,},
    // 1024x1024 in high costs 765 tokens
    // GPT-4 Vision responds only tens of chars if no max_tokens is given.
    {label: 'GPT-4 Vision', provider: 'openai', modelValue: 'gpt-4-vision-preview', sdkModelValue: 'gpt-4-vision-preview', qualityScore: 118/256*100, japaneseScore: 67, maxTokens: 4096, doesToolSupport: true, }, 

    // in $0.25 / out $1.25 /1M tokens
    {label: 'Anthropic Claude 3 Haiku', provider: 'anthropic', modelValue: 'claude-3-haiku-20240307', sdkModelValue: 'claude-3-haiku-20240307', qualityScore: 119/256*100, japaneseScore:63, maxTokens: 4096},
    // in $3.00 / out $15.00 /1M tokens
    {label: 'Anthropic Claude 3 Sonnet', provider: 'anthropic', modelValue: 'claude-3-sonnet-20240229', sdkModelValue: 'claude-3-sonnet-20240229', qualityScore: 254/256*100, japaneseScore:64, maxTokens: 4096},
    // in $15.00 / out $75.00 /1M tokens
    {label: 'Anthropic Claude 3 Opus', provider: 'anthropic', modelValue: 'claude-3-opus-20240229', sdkModelValue: 'claude-3-opus-20240229', qualityScore: 255/256*100, japaneseScore:64, maxTokens: 4096},

    // free (up to 60queries/min) 
    {label: 'Google Gemini 1.0 Pro', provider: 'google', modelValue: 'gemini-1.0-pro', sdkModelValue: 'gemini-pro', qualityScore: 122/256*100, japaneseScore: 64},
    // free (up to 60queries/min) 
    {label: 'Google Gemini 1.0 Pro Latest', provider: 'google', modelValue: 'gemini-1.0-pro-latest', sdkModelValue: 'gemini-1.0-pro-latest', qualityScore: 218/256*100, japaneseScore: 64},
    // cannot call from api. You can check available models from colab. https://ai.google.dev/tutorials/python_quickstart
    // {label: 'Google Gemini 1.5 Pro', provider: 'google', modelValue: 'gemini-1.5-pro-latest', sdkModelValue: 'gemini-1.5-pro-latest', qualityScore: 219/256*100, japaneseScore: 65},
    {label: 'Google Gemini Pro Vision', provider: 'google', modelValue: 'gemini-pro-vision', sdkModelValue: 'gemini-pro-vision', qualityScore: 218/256*100, japaneseScore: 64},

    // no longer necessary. Claude 3 is cheeper and better
    // in $0.0008/1k tokens, out $0.0024/1k tokens
    {label: 'Anthropic Claude Instant', provider: 'aws', modelValue: 'anthropic.claude-instant-v1', sdkModelValue: 'anthropic.claude-instant-v1', qualityScore: 150/256*100, japaneseScore:64}, // fast
    // in $0.008/1k tokens, out $0.024/1k tokens
    {label: 'Anthropic Claude 2.1', provider: 'aws', modelValue: 'anthropic.claude-v2', sdkModelValue: 'anthropic.claude-v2:1', qualityScore: 120/256*100, japaneseScore:67},

    // in 2.5€/M, out 7.5€/M
    {label: 'Mistral Medium', provider: 'mistral', modelValue: 'mistral-medium', sdkModelValue: 'mistral-medium', qualityScore: 152/256*100, japaneseScore:50},

    // free
    {label: 'Japanese StableLM Instruct Beta 70B', provider: 'fireworksai', modelValue: 'japanese-stablelm-instruct-beta-70b', sdkModelValue: 'accounts/stability/models/japanese-stablelm-instruct-beta-70b', qualityScore: 40, japaneseScore:37},

    {label: 'Qwen 72B Chat', provider: 'fireworksai', modelValue: 'qwen-72b-chat', sdkModelValue: 'accounts/fireworks/models/qwen-72b-chat', qualityScore: 147/256*100, japaneseScore:20},
    {label: 'Qwen 14B Chat', provider: 'fireworksai', modelValue: 'qwen-14b-chat', sdkModelValue: 'accounts/fireworks/models/qwen-14b-chat', qualityScore: 35/256*100, japaneseScore:10},

    // free. OSS based
    {label: 'FireLLaVA 13B', provider: 'fireworksai', modelValue: 'firellava-13b', sdkModelValue: 'accounts/fireworks/models/firellava-13b', qualityScore: 33, japaneseScore:15},

    {label: 'Perplexity Sonar Small', provider: 'perplexity', modelValue: 'sonar-small-chat', sdkModelValue: 'sonar-small-chat', qualityScore: 59, japaneseScore:12},
    // {label: 'Perplexity Sonar Small Online', provider: 'perplexity', modelValue: 'sonar-small-online', sdkModelValue: 'sonar-small-chat', qualityScore: 58, japaneseScore:11},
    {label: 'Perplexity Sonar Medium', provider: 'perplexity', modelValue: 'sonar-medium-chat', sdkModelValue: 'sonar-medium-chat', qualityScore: 61, japaneseScore:14},
    // {label: 'Perplexity Sonar Medium Online', provider: 'perplexity', modelValue: 'sonar-medium-online', sdkModelValue: 'sonar-medium-chat', qualityScore: 60, japaneseScore:13},

    {label: 'Gemma 7B Instruct', provider: 'huggingface', modelValue: 'gemma-7b-it', sdkModelValue: 'google/gemma-7b-it', qualityScore: 40, japaneseScore:10},
    {label: 'Gemma 7B', provider: 'huggingface', modelValue: 'gemma-7b', sdkModelValue: 'google/gemma-7b', qualityScore: 40-1, japaneseScore:10},
    {label: 'Gemma 2B Instruct', provider: 'huggingface', modelValue: 'gemma-2b-it', sdkModelValue: 'google/gemma-2b-it', qualityScore: 40/7*2, japaneseScore:0},
    {label: 'Gemma 2B', provider: 'huggingface', modelValue: 'gemma-2b', sdkModelValue: 'google/gemma-2b', qualityScore: 40/7*2-1, japaneseScore:0},

    {label: 'Groq Mixtral 8x7b', provider: 'groq', modelValue: 'groq-Mixtral-8x7b-Instruct-v0.1', sdkModelValue: 'mixtral-8x7b-32768', qualityScore: 152/256*100+1, japaneseScore:5},
    {label: 'Groq Llama 2 70B Chat', provider: 'groq', modelValue: 'groq-LLaMA2-70b-chat', sdkModelValue: 'llama2-70b-4096', qualityScore: 82/256*100+2, japaneseScore:5},
    {label: 'Groq Gemma 7B Instruct', provider: 'groq', modelValue: 'groq-gemma-7b-it', sdkModelValue: 'gemma-7b-it', qualityScore: 40/256*100+2, japaneseScore:10},

    {label: 'Mistral Small', provider: 'mistral', modelValue: 'mistral-small', sdkModelValue: 'mistral-small', qualityScore: 40, japaneseScore:5},
    // in 0.14€/M, out 0.42€/M
    {label: 'Mistral Tiny', provider: 'mistral', modelValue: 'mistral-tiny', sdkModelValue: 'mistral-tiny', qualityScore: 40, japaneseScore:10},
    {label: 'Mixtral 8x7b MoE (Hugging Face)', provider: 'fireworksai', modelValue: 'mixtral-8x7b-instruct-hf', sdkModelValue: 'accounts/fireworks/models/mixtral-8x7b-instruct-hf', qualityScore: 120/256*100, japaneseScore:5},
    // in:$0.4/M out:$1.6/M
    {label: 'Mixtral MoE 8x7B Instruct', provider: 'fireworksai', modelValue: 'mixtral-8x7b-instruct', sdkModelValue: 'accounts/fireworks/models/mixtral-8x7b-instruct', qualityScore: 120/256*100, japaneseScore:5},
    {label: 'Mistral 7B Instruct', provider: 'fireworksai', modelValue: 'mistral-7b-instruct-4k', sdkModelValue: 'accounts/fireworks/models/mistral-7b-instruct-4k', qualityScore: 152/256*100, japaneseScore:0},
    {label: 'Cohere Command Nightly', provider: 'cohere', modelValue: 'cohere-command-nightly', sdkModelValue: 'command-nightly', qualityScore: 40, japaneseScore:0},
    {label: 'Cohere Command Light Nightly', provider: 'cohere', modelValue: 'cohere-command-light-nightly', sdkModelValue: 'command-light-nightly', qualityScore: 40, japaneseScore:0},

    // free
    {label: 'Llama 2 70B Chat', provider: 'fireworksai', modelValue: 'llama-v2-70b-chat', sdkModelValue: 'accounts/fireworks/models/llama-v2-70b-chat', qualityScore: 82/256*100+1, japaneseScore:5},
    {label: 'Llama 2 70B Code Llama instruct', provider: 'fireworksai', modelValue: 'llama-v2-70b-code-instruct', sdkModelValue: 'accounts/fireworks/models/llama-v2-70b-code-instruct', qualityScore: 82/256*100, japaneseScore:5},
    // free
    {label: 'Llama 2 13B Chat', provider: 'fireworksai', modelValue: 'llama-v2-13b-chat', sdkModelValue: 'accounts/fireworks/models/llama-v2-13b-chat', qualityScore: 45/256*100, japaneseScore:5},
    {label: 'Llama 2 7B Chat', provider: 'fireworksai', modelValue: 'llama-v2-7b-chat', sdkModelValue: 'accounts/fireworks/models/llama-v2-7b-chat', qualityScore: 27/256*100, japaneseScore:5},

    {label: 'Capybara 34B', provider: 'fireworksai', modelValue: 'yi-34b-200k-capybara', sdkModelValue: 'accounts/fireworks/models/yi-34b-200k-capybara', qualityScore: 111/256*100, japaneseScore:5},
    {label: 'Open-Assistant SFT-4 12B', provider: 'huggingface', modelValue: 'oasst-sft-4-pythia-12b-epoch-3.5', sdkModelValue: 'OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5', qualityScore: 40, japaneseScore:0},
    // free. very low quality
    // {label: 'Japanese Stable LM Instruct Gamma 7B', provider: 'fireworks.ai', modelValue: 'japanese-stablelm-instruct-gamma-7b', sdkModelValue: 'accounts/stability/models/japanese-stablelm-instruct-gamma-7b', qualityScore: 40, japaneseScore:20}, // only work with 1 or 2 messages
    {label: 'StableLM Zephyr 3B', provider: 'fireworksai', modelValue: 'stablelm-zephyr-3b', sdkModelValue: 'accounts/stability/models/stablelm-zephyr-3b', qualityScore: 40, japaneseScore:0},

    // Vercel AI SDK for AWS supports Claude body format (prompt) but not titan (inputText)
    // {label: 'Titan Text G1 - Express', provider: 'aws', modelValue: 'amazon.titan-text-express-v1', sdkModelValue: 'amazon.titan-text-express-v1', recommendScore:20},  

    // Image generation - Works fine, but UI should be updated
    {label: 'DALL·E 2', provider: 'openai-image', modelValue: 'dall-e-2', sdkModelValue: 'dall-e-2', qualityScore: 40, japaneseScore:10},
    {label: 'DALL·E 3', provider: 'openai-image', modelValue: 'dall-e-3', sdkModelValue: 'dall-e-3', qualityScore: 40, japaneseScore:40},
    {label: 'Stable Diffusion 2', provider: 'huggingface-image', modelValue: 'stable-diffusion-2', sdkModelValue: 'stabilityai/stable-diffusion-2', qualityScore: 40, japaneseScore:10},
    ...(process.env.NODE_ENV === 'development' ? [
    // The following Models are not found...
    // https://readme.fireworks.ai/docs/querying-vision-language-models#can-firellava-generate-images
    // $0.0002/step
    // {label: 'Stable Diffusion XL', provider: 'fireworks.ai-image', modelValue: 'stable-diffusion-xl-1024-v1-0', sdkModelValue: 'accounts/fireworks/models/stable-diffusion-xl-1024-v1-0', qualityScore: 118/256*100, japaneseScore: 67},
    // // $0.0002/step
    // {label: 'Segmind Stable Diffusion 1B (SSD-1B)', provider: 'fireworks.ai-image', modelValue: 'SSD-1B', sdkModelValue: 'accounts/fireworks/models/SSD-1B', qualityScore: 118/256*100, japaneseScore: 67},
    // // $0.0002/step
    // {label: 'Japanese Stable Diffusion XL', provider: 'fireworks.ai-image', modelValue: 'japanese-stable-diffusion-xl', sdkModelValue: 'accounts/fireworks/models/japanese-stable-diffusion-xl', qualityScore: 118/256*100, japaneseScore: 67},
    // // $0.0002/step
    // {label: 'Playground v2 1024', provider: 'fireworks.ai-image', modelValue: 'playground-v2-1024px-aesthetic', sdkModelValue: 'accounts/fireworks/models/playground-v2-1024px-aesthetic', qualityScore: 118/256*100, japaneseScore: 67},
    ] as ChatModel0[] : []),
] as const

export type ModelLabel = typeof allModels0[number]['label'];
// export type ModelProvider = typeof allModels0[number]['provider'];
export type ModelValue = typeof allModels0[number]['modelValue'];
export type SdkModelValue = typeof allModels0[number]['sdkModelValue'];

export type ChatModel = {
    label: ModelLabel, // for human
    provider: ModelProvider,
    modelValue: ModelValue, // for url parameter and mulai internal value
    sdkModelValue: SdkModelValue, // the value to be passed to AI sdk
    qualityScore: number, // 0..100 (1000..1256) https://chat.lmsys.org/?arena as of 2024-02-23
    japaneseScore: number, // 0..100 https://wandb.ai/wandb-japan/llm-leaderboard/reports/Nejumi-LLM-Neo--Vmlldzo2MTkyMTU0 as of 2024-02-23
    maxTokens?: number, // Only if it should be passed as a parameter
    doesToolSupport?: boolean, // If the model supports tools and function calls
}


export const allModels:ChatModel[] = allModels0 as any
// fall back free model.
export const DEFAULT_MODEL:ChatModel = allModels.find(model => model.modelValue === 'gemini-1.0-pro') as ChatModel

export const allModelValues = allModels0.map(model => model.modelValue);


export function doesModelAcceptImageUrl(modelValue:ModelValue) {
    // Some other models have capabilities but the app implementation is not yet done.
    return modelValue === 'gpt-4-vision-preview' || modelValue === 'firellava-13b'
    || modelValue === 'gemini-pro-vision'
    // return true
}


// models which are choosable with the selection
export const selectableModels:ChatModel[] = allModels.filter((modelData) => {
    // currently all models are selectable
    return modelData.japaneseScore >= 0
})

// from all models
export function getModelByValue(modelValue:ModelValue):ChatModel | undefined {
    return allModels.find((value) => value.modelValue === modelValue)
}
