// called from edge and webapp

// If you want to remove some models, remove them from allModels to let api ignore the parameter
// It will also remove options from ModelSelector

// # openai 
//   https://openai.com/pricing#language-models
// # google
//   https://ai.google.dev/pricing
//   https://ai.google.dev/models/gemini
// # fireworks.ai
//   https://readme.fireworks.ai/page/pricing
//   https://fireworks.ai/models
export type ModelLabel 
    = 'GPT-3.5' // in $0.0005/1K tokens, out $0.0015/1K tokens
    | 'GPT-4' // in $0.01/1K tokens, out $0.03/1K tokens 
    | 'Gemini Pro' // free (up to 60queries/min) 
    | 'Gemini Pro Latest' // free (up to 60queries/min) 
    // fireworks.ai is free (some models) in dev 10q/min. devpro $1/1M tokens, 100q/min 
    | 'Japanese StableLM Instruct Beta 70B' // free
    | 'FireLLaVA 13B' // free. OSS based
    // additional
    | 'Japanese Stable LM Instruct Gamma 7B' // free. very low quality
    | 'Qwen 14B Chat' // in:$0.2/M out:$0.8/M
    | 'Qwen 72B Chat' // in:$0.7/M out:$2.8/M
    | 'Mixtral MoE 8x7B Instruct' // in:$0.4/M out:$1.6/M
    | 'Llama 2 7B Chat' // ?
    | 'Llama 2 13B Chat' // free
    | 'Llama 2 70B Chat' // free
// const modelLabels = [
//     'GPT-3.5', 
//     'GPT-4', 
//     'Gemini Pro', 
//     'Gemini Pro Latest',
//     'Japanese StableLM Instruct Beta 70B', // free
//     'FireLLaVA 13B', // free. OSS based
//     // additional  
//     'Japanese Stable LM Instruct Gamma 7B', // free. very low quality
//     'Qwen 14B Chat', // in:$0.2/M out:$0.8/M
//     'Qwen 72B Chat', // in:$0.7/M out:$2.8/M
//     'Mixtral MoE 8x7B Instruct', 
//     'Llama 2 7B Chat', 
//     'Llama 2 13B Chat', 
//     'Llama 2 70B Chat' // english only
// ] as const;

// export type ModelLabel = typeof modelLabels[number];

export type ModelVendor = 'openai' | 'google' | 'fireworks.ai'

export const modelValues = [
    'gpt-3.5-turbo', 
    'gpt-4-turbo-preview', 
    'gemini-pro', 
    'gemini-1.0-pro-latest',
    'japanese-stablelm-instruct-beta-70b',
    'japanese-stablelm-instruct-gamma-7b',
    'firellava-13b',
    'qwen-14b-chat',
    'qwen-72b-chat',
    'mixtral-8x7b-instruct',
    'llama-v2-7b-chat',
    'llama-v2-13b-chat',
    'llama-v2-70b-chat'
] as const;

export type ModelValue = typeof modelValues[number];

export type ModelCharacterPair = {modelValue:ModelValue, characterValue?:CharacterValue}

// model to call AI sdk
export type SdkModelValue = 'gpt-3.5-turbo' | 'gpt-4-turbo-preview' 
    | 'gemini-pro' | 'gemini-1.0-pro-latest'
    | 'accounts/stability/models/japanese-stablelm-instruct-beta-70b'
    | 'accounts/stability/models/japanese-stablelm-instruct-gamma-7b'
    | 'accounts/fireworks/models/firellava-13b'
    | 'accounts/fireworks/models/qwen-14b-chat'
    | 'accounts/fireworks/models/qwen-72b-chat'
    | 'accounts/fireworks/models/mixtral-8x7b-instruct'
    | 'accounts/fireworks/models/llama-v2-7b-chat'
    | 'accounts/fireworks/models/llama-v2-13b-chat'
    | 'accounts/fireworks/models/llama-v2-70b-chat'

export type ChatModelData = {
    label: ModelLabel, // for human
    recommendScore: number, // 0..100
    vendor: ModelVendor,
    modelValue: ModelValue, // for url parameter and internal
    sdkModelValue: SdkModelValue, // the value to be passed to AI sdk
}

// fall back free model.
export const DEFAULT_MODEL:ChatModelData
    = {label:'Gemini Pro', vendor: 'google', modelValue: 'gemini-pro', sdkModelValue: 'gemini-pro', recommendScore: 100}

// //  which can be choosable with the selection
// currently all models are selectable
export const selectableModels:ChatModelData[] = [
    {label:'GPT-3.5', vendor: 'openai', modelValue: 'gpt-3.5-turbo', sdkModelValue: 'gpt-3.5-turbo', recommendScore: 80},
    {label:'GPT-4', vendor: 'openai', modelValue: 'gpt-4-turbo-preview', sdkModelValue: 'gpt-4-turbo-preview', recommendScore: 100},
    {label:'Gemini Pro', vendor: 'google', modelValue: 'gemini-pro', sdkModelValue: 'gemini-pro', recommendScore: 100},
    {label:'Gemini Pro Latest', vendor: 'google', modelValue: 'gemini-1.0-pro-latest', sdkModelValue: 'gemini-1.0-pro-latest', recommendScore: 100},
    {label: 'Japanese StableLM Instruct Beta 70B', vendor: 'fireworks.ai', modelValue: 'japanese-stablelm-instruct-beta-70b', sdkModelValue: 'accounts/stability/models/japanese-stablelm-instruct-beta-70b', recommendScore:50},
    {label: 'FireLLaVA 13B', vendor: 'fireworks.ai', modelValue: 'firellava-13b', sdkModelValue: 'accounts/fireworks/models/firellava-13b', recommendScore:50},
]

// // models which can only be specified with the parameter. poorer Japanese quality models
// currently all models are selectable
export const allModels:ChatModelData[] = [
    ...selectableModels,
    // # japanese
    {label: 'Japanese Stable LM Instruct Gamma 7B', vendor: 'fireworks.ai', modelValue: 'japanese-stablelm-instruct-gamma-7b', sdkModelValue: 'accounts/stability/models/japanese-stablelm-instruct-gamma-7b', recommendScore:20},
    {label: 'Qwen 14B Chat', vendor: 'fireworks.ai', modelValue: 'qwen-14b-chat', sdkModelValue: 'accounts/fireworks/models/qwen-14b-chat', recommendScore:20},
    {label: 'Qwen 72B Chat', vendor: 'fireworks.ai', modelValue: 'qwen-72b-chat', sdkModelValue: 'accounts/fireworks/models/qwen-72b-chat', recommendScore:20},
    // # non-japanese output
    {label: 'Mixtral MoE 8x7B Instruct', vendor: 'fireworks.ai', modelValue: 'mixtral-8x7b-instruct', sdkModelValue: 'accounts/fireworks/models/mixtral-8x7b-instruct', recommendScore:20},
    {label: 'Llama 2 7B Chat', vendor: 'fireworks.ai', modelValue: 'llama-v2-7b-chat', sdkModelValue: 'accounts/fireworks/models/llama-v2-7b-chat', recommendScore:20},
    {label: 'Llama 2 13B Chat', vendor: 'fireworks.ai', modelValue: 'llama-v2-13b-chat', sdkModelValue: 'accounts/fireworks/models/llama-v2-13b-chat', recommendScore:20},
    {label: 'Llama 2 70B Chat', vendor: 'fireworks.ai', modelValue: 'llama-v2-70b-chat', sdkModelValue: 'accounts/fireworks/models/llama-v2-70b-chat', recommendScore:20},
]

// from all models
export function getModelByValue(modelValue:ModelValue):ChatModelData | undefined {
    return allModels.find((value) => value.modelValue === modelValue)
}

const DEFAULT_CHARACTER = ''
export const characterValues = ['', 'child', 'bullets', 'steps', 'optimist', 'pessimist', 'melchior', 'balthasar', 'caspar'] as const;
export type CharacterValue = typeof characterValues[number];

export type Character = {
    value: CharacterValue,
    label: string,
    promptContent: string,
    promptContent_ja: string,
}

export function validateModelCharacter(modelValueString:string, characterValueString:string):ModelCharacterPair {
    let modelValue = modelValueString as ModelValue 
    let characterValue = characterValueString as CharacterValue
    if (!modelValues.includes(modelValue)) {
        console.log('model not found:', modelValue, ' defaulting to ', DEFAULT_MODEL.modelValue)
        modelValue = DEFAULT_MODEL.modelValue
    }
    if (!characterValues.includes(characterValue)) {
        console.log('character not found:', characterValue, ' defaulting to ', DEFAULT_CHARACTER)
        characterValue = DEFAULT_CHARACTER
    }
    return {modelValue, characterValue}
}
