// called from edge and webapp

// If you want to remove some models, remove them from allModels to let api ignore the parameter
// It will also remove options from ModelSelector

// # openai 
//   https://openai.com/pricing#language-models
//   https://platform.openai.com/docs/models/gpt-4-and-gpt-4-turbo
// # google
//   https://ai.google.dev/pricing
//   https://ai.google.dev/models/gemini
// # fireworks.ai
//   https://readme.fireworks.ai/page/pricing
//   https://fireworks.ai/models
// # AWS Bedrock Anthropic Claude
//   https://ap-northeast-1.console.aws.amazon.com/bedrock/home?region=ap-northeast-1#/providers?model=anthropic.claude-v2:1
// # Mistral
//   https://docs.mistral.ai/platform/endpoints/
export type ModelLabel 
    = 'GPT-3.5' // in $0.0005/1K tokens, out $0.0015/1K tokens
    | 'GPT-4' // in $0.03/1K tokens, out $0.06/1K tokens
    | 'GPT-4 Turbo' // in $0.01/1K tokens, out $0.03/1K tokens 
    | 'Google Gemini Pro' // free (up to 60queries/min) 
    | 'Google Gemini Pro Latest' // free (up to 60queries/min) 
    // fireworks.ai is free (some models) in dev 10q/min. devpro $1/1M tokens, 100q/min 
    | 'Japanese StableLM Instruct Beta 70B' // free
    | 'FireLLaVA 13B' // free. OSS based
    | 'Japanese Stable LM Instruct Gamma 7B' // free. very low quality
    | 'Qwen 14B Chat' // in:$0.2/M out:$0.8/M
    | 'Qwen 72B Chat' // in:$0.7/M out:$2.8/M
    | 'Mixtral 8x7b MoE (Hugging Face)'
    | 'Mixtral MoE 8x7B Instruct' // in:$0.4/M out:$1.6/M
    | 'Llama 2 7B Chat' // ?
    | 'Llama 2 13B Chat' // free
    | 'Llama 2 70B Chat' // free
    | 'Llama 2 70B Code Llama instruct'
    | 'Open-Assistant SFT-4 12B'
    | 'Gemma 2B'
    | 'Gemma 2B Instruct'
    | 'Gemma 7B'
    | 'Gemma 7B Instruct'
    | 'Cohere Command Light Nightly'
    | 'Cohere Command Nightly'
    | 'Capybara 34B'
    | 'Mistral 7B Instruct'
    | 'StableLM Zephyr 3B'
    | 'Anthropic Claude'
    | 'Anthropic Claude Instant'
    | 'Titan Text G1 - Express'
    | 'Mistral Tiny' // in 0.14€/M, out 0.42€/M
    | 'Mistral Small'
    | 'Mistral Medium' // in 2.5€/M, out 7.5€/M

// const modelLabels = [
//     'GPT-3.5', 
//     'GPT-4', 
// ] as const;
// export type ModelLabel = typeof modelLabels[number];

export type ModelVendor = 'openai' | 'google' | 'fireworks.ai' | 'HuggingFace' | 'cohere' | 'aws' | 'mistral'

export const allModelValues = [
    'gpt-3.5-turbo', 
    'gpt-4', 
    'gpt-4-turbo-preview', 
    'gemini-pro', 
    'gemini-1.0-pro-latest',
    'japanese-stablelm-instruct-beta-70b',
    'japanese-stablelm-instruct-gamma-7b',
    'firellava-13b',
    'qwen-14b-chat',
    'qwen-72b-chat',
    'mixtral-8x7b-instruct-hf',
    'mixtral-8x7b-instruct',
    'llama-v2-7b-chat',
    'llama-v2-13b-chat',
    'llama-v2-70b-chat',
    'oasst-sft-4-pythia-12b-epoch-3.5',
    'gemma-2b',
    'gemma-2b-it',
    'gemma-7b',
    'gemma-7b-it',
    'cohere-command-light-nightly',
    'cohere-command-nightly',
    'yi-34b-200k-capybara',
    'mistral-7b-instruct-4k',
    'llama-v2-70b-code-instruct',
    'stablelm-zephyr-3b',
    'anthropic.claude-v2:1',
    'anthropic.claude-instant-v1',
    'mistral-medium',
    'mistral-small',
    'mistral-tiny',
] as const;

export type ModelValue = typeof allModelValues[number];

export type ModelCharacterPair = {modelValue:ModelValue, characterValue:CharacterValue}

// model to call AI sdk
export type SdkModelValue = 'gpt-3.5-turbo' | 'gpt-4' | 'gpt-4-turbo-preview'
    | 'gemini-pro' | 'gemini-1.0-pro-latest'
    | 'accounts/stability/models/japanese-stablelm-instruct-beta-70b'
    | 'accounts/stability/models/japanese-stablelm-instruct-gamma-7b'
    | 'accounts/fireworks/models/firellava-13b'
    | 'accounts/fireworks/models/qwen-14b-chat'
    | 'accounts/fireworks/models/qwen-72b-chat'
    | 'accounts/fireworks/models/mixtral-8x7b-instruct-hf'
    | 'accounts/fireworks/models/mixtral-8x7b-instruct'
    | 'accounts/fireworks/models/llama-v2-7b-chat'
    | 'accounts/fireworks/models/llama-v2-13b-chat'
    | 'accounts/fireworks/models/llama-v2-70b-chat'
    | 'OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5'
    | 'google/gemma-2b'
    | 'google/gemma-2b-it'
    | 'google/gemma-7b'
    | 'google/gemma-7b-it'
    | 'command-light-nightly'
    | 'command-nightly'
    | 'accounts/fireworks/models/yi-34b-200k-capybara'
    | 'accounts/fireworks/models/mistral-7b-instruct-4k'
    | 'accounts/fireworks/models/llama-v2-70b-code-instruct'
    | 'accounts/stability/models/stablelm-zephyr-3b'
    | 'anthropic.claude-v2:1'
    | 'anthropic.claude-instant-v1'
    | 'mistral-medium'
    | 'mistral-small'
    | 'mistral-tiny'

export type ChatModelData = {
    label: ModelLabel, // for human
    qualityScore: number, // 0..100 (1000..1256) https://chat.lmsys.org/?arena as of 2024-02-23
    japaneseScore: number, // 0..100 https://wandb.ai/wandb-japan/llm-leaderboard/reports/Nejumi-LLM-Neo--Vmlldzo2MTkyMTU0 as of 2024-02-23
    vendor: ModelVendor,
    modelValue: ModelValue, // for url parameter and mulai internal value
    sdkModelValue: SdkModelValue, // the value to be passed to AI sdk
}

// fall back free model.
export const DEFAULT_MODEL:ChatModelData
    = {label: 'Google Gemini Pro', vendor: 'google', modelValue: 'gemini-pro', sdkModelValue: 'gemini-pro', qualityScore: 122/256*100, japaneseScore: 64}

// models will be displayed in this order
export const allModels:ChatModelData[] = [
    {label: 'GPT-3.5', vendor: 'openai', modelValue: 'gpt-3.5-turbo', sdkModelValue: 'gpt-3.5-turbo', qualityScore: 118/256*100, japaneseScore: 67}, // fast
    {label: 'GPT-4', vendor: 'openai', modelValue: 'gpt-4', sdkModelValue: 'gpt-4-turbo-preview', qualityScore: 254/256*100, japaneseScore: 76},
    {label: 'GPT-4 Turbo', vendor: 'openai', modelValue: 'gpt-4-turbo-preview', sdkModelValue: 'gpt-4-turbo-preview', qualityScore: 253/256*100, japaneseScore: 77},
    
    {label: 'Google Gemini Pro', vendor: 'google', modelValue: 'gemini-pro', sdkModelValue: 'gemini-pro', qualityScore: 122/256*100, japaneseScore: 64},
    {label: 'Google Gemini Pro Latest', vendor: 'google', modelValue: 'gemini-1.0-pro-latest', sdkModelValue: 'gemini-1.0-pro-latest', qualityScore: 218/256*100, japaneseScore: 64},

    {label: 'Anthropic Claude Instant', vendor: 'aws', modelValue: 'anthropic.claude-instant-v1', sdkModelValue: 'anthropic.claude-instant-v1', qualityScore: 150/256*100, japaneseScore:64}, // fast
    {label: 'Anthropic Claude', vendor: 'aws', modelValue: 'anthropic.claude-v2:1', sdkModelValue: 'anthropic.claude-v2:1', qualityScore: 120/256*100, japaneseScore:67},

    {label: 'Mistral Medium', vendor: 'mistral', modelValue: 'mistral-medium', sdkModelValue: 'mistral-medium', qualityScore: 152/256*100, japaneseScore:50},

    {label: 'Japanese StableLM Instruct Beta 70B', vendor: 'fireworks.ai', modelValue: 'japanese-stablelm-instruct-beta-70b', sdkModelValue: 'accounts/stability/models/japanese-stablelm-instruct-beta-70b', qualityScore: 50, japaneseScore:37},

    {label: 'Qwen 72B Chat', vendor: 'fireworks.ai', modelValue: 'qwen-72b-chat', sdkModelValue: 'accounts/fireworks/models/qwen-72b-chat', qualityScore: 147/256*100, japaneseScore:20},
    {label: 'Qwen 14B Chat', vendor: 'fireworks.ai', modelValue: 'qwen-14b-chat', sdkModelValue: 'accounts/fireworks/models/qwen-14b-chat', qualityScore: 35/256*100, japaneseScore:10},

    {label: 'FireLLaVA 13B', vendor: 'fireworks.ai', modelValue: 'firellava-13b', sdkModelValue: 'accounts/fireworks/models/firellava-13b', qualityScore: 33, japaneseScore:15},

    {label: 'Gemma 7B Instruct', vendor: 'HuggingFace', modelValue: 'gemma-7b-it', sdkModelValue: 'google/gemma-7b-it', qualityScore: 50, japaneseScore:10},
    {label: 'Gemma 7B', vendor: 'HuggingFace', modelValue: 'gemma-7b', sdkModelValue: 'google/gemma-7b', qualityScore: 50, japaneseScore:10},
    {label: 'Gemma 2B Instruct', vendor: 'HuggingFace', modelValue: 'gemma-2b-it', sdkModelValue: 'google/gemma-2b-it', qualityScore: 50, japaneseScore:0},
    {label: 'Gemma 2B', vendor: 'HuggingFace', modelValue: 'gemma-2b', sdkModelValue: 'google/gemma-2b', qualityScore: 50, japaneseScore:0},

    {label: 'Mistral Small', vendor: 'mistral', modelValue: 'mistral-small', sdkModelValue: 'mistral-small', qualityScore: 50, japaneseScore:5},
    {label: 'Mistral Tiny', vendor: 'mistral', modelValue: 'mistral-tiny', sdkModelValue: 'mistral-tiny', qualityScore: 50, japaneseScore:10},
    {label: 'Mixtral 8x7b MoE (Hugging Face)', vendor: 'fireworks.ai', modelValue: 'mixtral-8x7b-instruct-hf', sdkModelValue: 'accounts/fireworks/models/mixtral-8x7b-instruct-hf', qualityScore: 120/256*100, japaneseScore:5},
    {label: 'Mixtral MoE 8x7B Instruct', vendor: 'fireworks.ai', modelValue: 'mixtral-8x7b-instruct', sdkModelValue: 'accounts/fireworks/models/mixtral-8x7b-instruct', qualityScore: 120/256*100, japaneseScore:5},
    {label: 'Mistral 7B Instruct', vendor: 'fireworks.ai', modelValue: 'mistral-7b-instruct-4k', sdkModelValue: 'accounts/fireworks/models/mistral-7b-instruct-4k', qualityScore: 152/256*100, japaneseScore:0},
    {label: 'Cohere Command Light Nightly', vendor: 'cohere', modelValue: 'cohere-command-light-nightly', sdkModelValue: 'command-light-nightly', qualityScore: 50, japaneseScore:0},
    {label: 'Cohere Command Nightly', vendor: 'cohere', modelValue: 'cohere-command-nightly', sdkModelValue: 'command-nightly', qualityScore: 50, japaneseScore:0},

    {label: 'Llama 2 70B Chat', vendor: 'fireworks.ai', modelValue: 'llama-v2-70b-chat', sdkModelValue: 'accounts/fireworks/models/llama-v2-70b-chat', qualityScore: 50, japaneseScore:5},
    {label: 'Llama 2 70B Code Llama instruct', vendor: 'fireworks.ai', modelValue: 'llama-v2-70b-code-instruct', sdkModelValue: 'accounts/fireworks/models/llama-v2-70b-code-instruct', qualityScore: 82/256*100, japaneseScore:5},
    {label: 'Llama 2 13B Chat', vendor: 'fireworks.ai', modelValue: 'llama-v2-13b-chat', sdkModelValue: 'accounts/fireworks/models/llama-v2-13b-chat', qualityScore: 45/256*100, japaneseScore:5},
    {label: 'Llama 2 7B Chat', vendor: 'fireworks.ai', modelValue: 'llama-v2-7b-chat', sdkModelValue: 'accounts/fireworks/models/llama-v2-7b-chat', qualityScore: 27/256*100, japaneseScore:5},

    {label: 'Capybara 34B', vendor: 'fireworks.ai', modelValue: 'yi-34b-200k-capybara', sdkModelValue: 'accounts/fireworks/models/yi-34b-200k-capybara', qualityScore: 111/256*100, japaneseScore:5},
    {label: 'Open-Assistant SFT-4 12B', vendor: 'HuggingFace', modelValue: 'oasst-sft-4-pythia-12b-epoch-3.5', sdkModelValue: 'OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5', qualityScore: 50, japaneseScore:0},
    // {label: 'Japanese Stable LM Instruct Gamma 7B', vendor: 'fireworks.ai', modelValue: 'japanese-stablelm-instruct-gamma-7b', sdkModelValue: 'accounts/stability/models/japanese-stablelm-instruct-gamma-7b', qualityScore: 50, japaneseScore:20}, // only work with 1 or 2 messages
    {label: 'StableLM Zephyr 3B', vendor: 'fireworks.ai', modelValue: 'stablelm-zephyr-3b', sdkModelValue: 'accounts/stability/models/stablelm-zephyr-3b', qualityScore: 50, japaneseScore:0},

    // Vercel AI SDK for AWS supports Claude body format (prompt) but not titan (inputText)
    // {label: 'Titan Text G1 - Express', vendor: 'aws', modelValue: 'amazon.titan-text-express-v1', sdkModelValue: 'amazon.titan-text-express-v1', recommendScore:20},  
]

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
