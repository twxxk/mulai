// called from edge and webapp

// # openai 
//   gpt-4-0125-preview (turbo) in $0.01/1K tokens, out $0.03/1K tokens 
//   gpt-3.5-turbo-0125         in $0.0005/1K tokens, out $0.0015/1K tokens
//   https://openai.com/pricing#language-models
// # google
//   free (up to 60queries/min) 
//   https://ai.google.dev/pricing
//   https://ai.google.dev/models/gemini
// # fireworks.ai
//   free (some models) in dev 10q/min. devpro $1/1M tokens, 100q/min 
//   https://readme.fireworks.ai/page/pricing
//   https://fireworks.ai/models
export type ModelLabel = 'GPT-3.5' | 'GPT-4' | 'Gemini Pro' | 'Gemini Pro Latest'
    | 'Japanese StableLM Instruct Beta 70B' // free
    // | 'Japanese Stable LM Instruct Gamma 7B' // free. very low quality
    | 'FireLLaVA 13B' // free. OSS based
    // | 'Qwen 14B Chat' // in:$0.2/M out:$0.8/M
    // | 'Qwen 72B Chat' // in:$0.7/M out:$2.8/M
    // | 'Mixtral MoE 8x7B Instruct' | 'Llama 2 7B Chat' | 'Llama 2 13B Chat' | 'Llama 2 70B Chat' // english only

export type ModelVendor = 'openai' | 'google' | 'fireworks.ai'

export type ModelValue = 'gpt-3.5-turbo' | 'gpt-4-turbo-preview' 
    | 'gemini-pro' | 'gemini-1.0-pro-latest'
    | 'accounts/stability/models/japanese-stablelm-instruct-beta-70b'
    | 'accounts/stability/models/japanese-stablelm-instruct-gamma-7b'
    | 'accounts/fireworks/models/firellava-13b'

type ChatModelData = {
    label: ModelLabel,
    vendor: ModelVendor,
    model: ModelValue, // pass to ai
}

export const DEFAULT_MODEL:ChatModelData
    = {label:'Gemini Pro', vendor: 'google', model: 'gemini-pro'} // fall back free model.

export const modelList:ChatModelData[] = [
    {label:'GPT-3.5', vendor: 'openai', model: 'gpt-3.5-turbo'},
    {label:'GPT-4', vendor: 'openai', model: 'gpt-4-turbo-preview'},
    {label:'Gemini Pro', vendor: 'google', model: 'gemini-pro'},
    {label:'Gemini Pro Latest', vendor: 'google', model: 'gemini-1.0-pro-latest'},
    // # japanese
    {label: 'Japanese StableLM Instruct Beta 70B', vendor: 'fireworks.ai', model: 'accounts/stability/models/japanese-stablelm-instruct-beta-70b'},
    // {label: 'Japanese Stable LM Instruct Gamma 7B', vendor: 'fireworks.ai', model: 'accounts/stability/models/japanese-stablelm-instruct-gamma-7b'},
    {label: 'FireLLaVA 13B', vendor: 'fireworks.ai', model: 'accounts/fireworks/models/firellava-13b'},
    // {vendor: 'fireworks.ai', model: 'accounts/fireworks/models/qwen-14b-chat'},
    // {vendor: 'fireworks.ai', model: 'accounts/fireworks/models/qwen-72b-chat'},
    // # non-japanese output
    // {vendor: 'fireworks.ai', model: 'accounts/fireworks/models/mixtral-8x7b-instruct'},
    // {vendor: 'fireworks.ai', model: 'accounts/fireworks/models/llama-v2-7b-chat'},
    // {vendor: 'fireworks.ai', model: 'accounts/fireworks/models/llama-v2-13b-chat'},
    // {vendor: 'fireworks.ai', model: 'accounts/fireworks/models/llama-v2-70b-chat'},
]

export function getModelByValue(modelValue:ModelValue):ChatModelData | undefined {
    return modelList.find((value) => value.model === modelValue)
}
  
export type CharacterValue = '' | 'child' | 'bullets' | 'steps' | 'melchior' | 'balthasar' | 'caspar'

export type Character = {
    value: CharacterValue,
    label: string,
    promptContent: string,
}
