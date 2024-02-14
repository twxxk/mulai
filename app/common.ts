// called from edge and weba pp

// # openai https://openai.com/pricing#language-models
// # google https://ai.google.dev/pricing
// # fireworks.ai https://fireworks.ai/models
export type ModelLabel = 'GPT-3.5' | 'GPT-4' | 'Gemini Pro' 
    | 'Japanese StableLM Instruct Beta 70B' // free
    | 'Japanese Stable LM Instruct Gamma 7B' // free. very low quality
    | 'FireLLaVA 13B' // free. OSS based
    // | 'Qwen 14B Chat' // in:$0.2/M out:$0.8/M
    // | 'Qwen 72B Chat' // in:$0.7/M out:$2.8/M
    // | 'Mixtral MoE 8x7B Instruct' | 'Llama 2 7B Chat' | 'Llama 2 13B Chat' | 'Llama 2 70B Chat' // english only
