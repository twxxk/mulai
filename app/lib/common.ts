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
//   https://ap-northeast-1.console.aws.amazon.com/bedrock/home?region=ap-northeast-1#/providers?model=anthropic.claude-v2
// # Mistral
//   https://docs.mistral.ai/platform/endpoints/
// # Groq
//   https://console.groq.com/docs/models

export type ModelVendor = 'openai' | 'google' | 'fireworks.ai' | 'HuggingFace' | 'cohere' | 'aws' | 'mistral' | 'groq'
    | 'openai-image' | 'HuggingFace-image' | 'fireworks.ai-image'

type ModelData0 = {
    label: string,
    vendor: ModelVendor,
    modelValue: string,
    sdkModelValue: string,
    qualityScore: number,
    japaneseScore: number,
    maxTokens?: number,
}
// models will be displayed in this order
const allModels0:ModelData0[] = [
    // Works fine, but UI should be updated
    ...(process.env.NODE_ENV === 'development' ? [
    {label: 'DALL·E 2', vendor: 'openai-image', modelValue: 'dall-e-2', sdkModelValue: 'dall-e-2', qualityScore: 40, japaneseScore:10},
    {label: 'DALL·E 3', vendor: 'openai-image', modelValue: 'dall-e-3', sdkModelValue: 'dall-e-3', qualityScore: 40, japaneseScore:10},
    {label: 'Stable Diffusion 2', vendor: 'HuggingFace-image', modelValue: 'stable-diffusion-2', sdkModelValue: 'stabilityai/stable-diffusion-2', qualityScore: 40, japaneseScore:10},
    ] as ModelData0[] : []),

    // fast. in $0.0005/1K tokens, out $0.0015/1K tokens
    {label: 'GPT-3.5', vendor: 'openai', modelValue: 'gpt-3.5-turbo', sdkModelValue: 'gpt-3.5-turbo', qualityScore: 118/256*100, japaneseScore: 67},
    // in $0.03/1K tokens, out $0.06/1K tokens
    {label: 'GPT-4', vendor: 'openai', modelValue: 'gpt-4', sdkModelValue: 'gpt-4-turbo-preview', qualityScore: 254/256*100, japaneseScore: 76},
    // in $0.01/1K tokens, out $0.03/1K tokens 
    {label: 'GPT-4 Turbo', vendor: 'openai', modelValue: 'gpt-4-turbo-preview', sdkModelValue: 'gpt-4-turbo-preview', qualityScore: 253/256*100, japaneseScore: 77},
    // 1024x1024 in high costs 765 tokens
    // GPT-4 Vision responds only tens of chars if no max_tokens is given.
    {label: 'GPT-4 Vision', vendor: 'openai', modelValue: 'gpt-4-vision-preview', sdkModelValue: 'gpt-4-vision-preview', qualityScore: 118/256*100, japaneseScore: 67, maxTokens: 4096 }, 

    // free (up to 60queries/min) 
    {label: 'Google Gemini Pro', vendor: 'google', modelValue: 'gemini-pro', sdkModelValue: 'gemini-pro', qualityScore: 122/256*100, japaneseScore: 64},
    // free (up to 60queries/min) 
    {label: 'Google Gemini Pro Latest', vendor: 'google', modelValue: 'gemini-1.0-pro-latest', sdkModelValue: 'gemini-1.0-pro-latest', qualityScore: 218/256*100, japaneseScore: 64},
    {label: 'Google Gemini Pro Vision', vendor: 'google', modelValue: 'gemini-pro-vision', sdkModelValue: 'gemini-pro-vision', qualityScore: 218/256*100, japaneseScore: 64},

    {label: 'Anthropic Claude Instant', vendor: 'aws', modelValue: 'anthropic.claude-instant-v1', sdkModelValue: 'anthropic.claude-instant-v1', qualityScore: 150/256*100, japaneseScore:64}, // fast
    {label: 'Anthropic Claude', vendor: 'aws', modelValue: 'anthropic.claude-v2', sdkModelValue: 'anthropic.claude-v2:1', qualityScore: 120/256*100, japaneseScore:67},

    // in 2.5€/M, out 7.5€/M
    {label: 'Mistral Medium', vendor: 'mistral', modelValue: 'mistral-medium', sdkModelValue: 'mistral-medium', qualityScore: 152/256*100, japaneseScore:50},

    // free
    {label: 'Japanese StableLM Instruct Beta 70B', vendor: 'fireworks.ai', modelValue: 'japanese-stablelm-instruct-beta-70b', sdkModelValue: 'accounts/stability/models/japanese-stablelm-instruct-beta-70b', qualityScore: 40, japaneseScore:37},

    {label: 'Qwen 72B Chat', vendor: 'fireworks.ai', modelValue: 'qwen-72b-chat', sdkModelValue: 'accounts/fireworks/models/qwen-72b-chat', qualityScore: 147/256*100, japaneseScore:20},
    {label: 'Qwen 14B Chat', vendor: 'fireworks.ai', modelValue: 'qwen-14b-chat', sdkModelValue: 'accounts/fireworks/models/qwen-14b-chat', qualityScore: 35/256*100, japaneseScore:10},

    // free. OSS based
    {label: 'FireLLaVA 13B', vendor: 'fireworks.ai', modelValue: 'firellava-13b', sdkModelValue: 'accounts/fireworks/models/firellava-13b', qualityScore: 33, japaneseScore:15},

    {label: 'Gemma 7B Instruct', vendor: 'HuggingFace', modelValue: 'gemma-7b-it', sdkModelValue: 'google/gemma-7b-it', qualityScore: 40, japaneseScore:10},
    {label: 'Gemma 7B', vendor: 'HuggingFace', modelValue: 'gemma-7b', sdkModelValue: 'google/gemma-7b', qualityScore: 40-1, japaneseScore:10},
    {label: 'Gemma 2B Instruct', vendor: 'HuggingFace', modelValue: 'gemma-2b-it', sdkModelValue: 'google/gemma-2b-it', qualityScore: 40/7*2, japaneseScore:0},
    {label: 'Gemma 2B', vendor: 'HuggingFace', modelValue: 'gemma-2b', sdkModelValue: 'google/gemma-2b', qualityScore: 40/7*2-1, japaneseScore:0},

    {label: 'Groq Mixtral 8x7b', vendor: 'groq', modelValue: 'groq-Mixtral-8x7b-Instruct-v0.1', sdkModelValue: 'mixtral-8x7b-32768', qualityScore: 152/256*100+1, japaneseScore:5},
    {label: 'Groq Llama 2 70B Chat', vendor: 'groq', modelValue: 'groq-LLaMA2-70b-chat', sdkModelValue: 'llama2-70b-4096', qualityScore: 82/256*100+2, japaneseScore:5},

    {label: 'Mistral Small', vendor: 'mistral', modelValue: 'mistral-small', sdkModelValue: 'mistral-small', qualityScore: 40, japaneseScore:5},
    // in 0.14€/M, out 0.42€/M
    {label: 'Mistral Tiny', vendor: 'mistral', modelValue: 'mistral-tiny', sdkModelValue: 'mistral-tiny', qualityScore: 40, japaneseScore:10},
    {label: 'Mixtral 8x7b MoE (Hugging Face)', vendor: 'fireworks.ai', modelValue: 'mixtral-8x7b-instruct-hf', sdkModelValue: 'accounts/fireworks/models/mixtral-8x7b-instruct-hf', qualityScore: 120/256*100, japaneseScore:5},
    // in:$0.4/M out:$1.6/M
    {label: 'Mixtral MoE 8x7B Instruct', vendor: 'fireworks.ai', modelValue: 'mixtral-8x7b-instruct', sdkModelValue: 'accounts/fireworks/models/mixtral-8x7b-instruct', qualityScore: 120/256*100, japaneseScore:5},
    {label: 'Mistral 7B Instruct', vendor: 'fireworks.ai', modelValue: 'mistral-7b-instruct-4k', sdkModelValue: 'accounts/fireworks/models/mistral-7b-instruct-4k', qualityScore: 152/256*100, japaneseScore:0},
    {label: 'Cohere Command Nightly', vendor: 'cohere', modelValue: 'cohere-command-nightly', sdkModelValue: 'command-nightly', qualityScore: 40, japaneseScore:0},
    {label: 'Cohere Command Light Nightly', vendor: 'cohere', modelValue: 'cohere-command-light-nightly', sdkModelValue: 'command-light-nightly', qualityScore: 40, japaneseScore:0},

    // free
    {label: 'Llama 2 70B Chat', vendor: 'fireworks.ai', modelValue: 'llama-v2-70b-chat', sdkModelValue: 'accounts/fireworks/models/llama-v2-70b-chat', qualityScore: 82/256*100+1, japaneseScore:5},
    {label: 'Llama 2 70B Code Llama instruct', vendor: 'fireworks.ai', modelValue: 'llama-v2-70b-code-instruct', sdkModelValue: 'accounts/fireworks/models/llama-v2-70b-code-instruct', qualityScore: 82/256*100, japaneseScore:5},
    // free
    {label: 'Llama 2 13B Chat', vendor: 'fireworks.ai', modelValue: 'llama-v2-13b-chat', sdkModelValue: 'accounts/fireworks/models/llama-v2-13b-chat', qualityScore: 45/256*100, japaneseScore:5},
    {label: 'Llama 2 7B Chat', vendor: 'fireworks.ai', modelValue: 'llama-v2-7b-chat', sdkModelValue: 'accounts/fireworks/models/llama-v2-7b-chat', qualityScore: 27/256*100, japaneseScore:5},

    {label: 'Capybara 34B', vendor: 'fireworks.ai', modelValue: 'yi-34b-200k-capybara', sdkModelValue: 'accounts/fireworks/models/yi-34b-200k-capybara', qualityScore: 111/256*100, japaneseScore:5},
    {label: 'Open-Assistant SFT-4 12B', vendor: 'HuggingFace', modelValue: 'oasst-sft-4-pythia-12b-epoch-3.5', sdkModelValue: 'OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5', qualityScore: 40, japaneseScore:0},
    // free. very low quality
    // {label: 'Japanese Stable LM Instruct Gamma 7B', vendor: 'fireworks.ai', modelValue: 'japanese-stablelm-instruct-gamma-7b', sdkModelValue: 'accounts/stability/models/japanese-stablelm-instruct-gamma-7b', qualityScore: 40, japaneseScore:20}, // only work with 1 or 2 messages
    {label: 'StableLM Zephyr 3B', vendor: 'fireworks.ai', modelValue: 'stablelm-zephyr-3b', sdkModelValue: 'accounts/stability/models/stablelm-zephyr-3b', qualityScore: 40, japaneseScore:0},

    // Vercel AI SDK for AWS supports Claude body format (prompt) but not titan (inputText)
    // {label: 'Titan Text G1 - Express', vendor: 'aws', modelValue: 'amazon.titan-text-express-v1', sdkModelValue: 'amazon.titan-text-express-v1', recommendScore:20},  
] as const

export type ModelLabel = typeof allModels0[number]['label'];
// export type ModelVendor = typeof allModels0[number]['vendor'];
export type ModelValue = typeof allModels0[number]['modelValue'];
export type SdkModelValue = typeof allModels0[number]['sdkModelValue'];

export type ChatModelData = {
    label: ModelLabel, // for human
    vendor: ModelVendor,
    modelValue: ModelValue, // for url parameter and mulai internal value
    sdkModelValue: SdkModelValue, // the value to be passed to AI sdk
    qualityScore: number, // 0..100 (1000..1256) https://chat.lmsys.org/?arena as of 2024-02-23
    japaneseScore: number, // 0..100 https://wandb.ai/wandb-japan/llm-leaderboard/reports/Nejumi-LLM-Neo--Vmlldzo2MTkyMTU0 as of 2024-02-23
    maxTokens?: number, // Only if it should be passed as a parameter
}

export type ModelCharacterPair = {modelValue:ModelValue, characterValue:CharacterValue}


export const allModels:ChatModelData[] = allModels0 as any
// fall back free model.
export const DEFAULT_MODEL:ChatModelData = allModels.find(model => model.modelValue === 'gemini-pro') as ChatModelData

export const allModelValues = allModels0.map(model => model.modelValue);


export function doesModelAcceptImageUrl(modelValue:ModelValue) {
    return modelValue === 'gpt-4-vision-preview' || modelValue === 'firellava-13b'
    || modelValue === 'gemini-pro-vision'
    // return true
}


// models which are choosable with the selection
export const selectableModels:ChatModelData[] = allModels.filter((modelData) => {
    // currently all models are selectable
    return modelData.japaneseScore >= 0
})

// from all models
export function getModelByValue(modelValue:ModelValue):ChatModelData | undefined {
    return allModels.find((value) => value.modelValue === modelValue)
}

export const characterValues = ['', 'child', 'bullets', 'steps', 'proofreading', 'optimist', 'pessimist', 'melchior', 'balthasar', 'caspar'] as const;
export type CharacterValue = typeof characterValues[number];
export const DEFAULT_CHARACTER_VALUE:CharacterValue = ''

export type Character = {
    value: CharacterValue,
    label: string,
    label_ja: string,
    promptContent: string,
    promptContent_ja: string,
    assistantPromptContent?: string,
    assistantPromptContent_ja?: string,
}

export function validateModelCharacter(modelValueString:string, characterValueString:string):ModelCharacterPair {
    let modelValue = modelValueString as ModelValue 
    let characterValue = characterValueString as CharacterValue
    if (!allModelValues.includes(modelValue)) {
        console.log('model not found:', modelValue, ' defaulting to ', DEFAULT_MODEL.modelValue)
        modelValue = DEFAULT_MODEL.modelValue
    }
    if (!characterValues.includes(characterValue)) {
        console.log('character not found:', characterValue, ' defaulting to ', DEFAULT_CHARACTER_VALUE)
        characterValue = DEFAULT_CHARACTER_VALUE
    }
    return {modelValue, characterValue}
}
