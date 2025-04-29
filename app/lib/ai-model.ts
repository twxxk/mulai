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
//   https://docs.aws.amazon.com/bedrock/latest/userguide/model-ids.html
//   https://aws.amazon.com/jp/bedrock/pricing/
// # Mistral
//   https://docs.mistral.ai/platform/endpoints/
// # Groq
//   https://console.groq.com/docs/models
// # Perplexity
//   https://docs.perplexity.ai/docs/model-cards
// # Anthropic
//   https://docs.anthropic.com/claude/docs/models-overview
// # Deepseek
//   https://api-docs.deepseek.com/quick_start/pricing/
// # OpenRouter
//   https://openrouter.ai/models?q=claude&order=top-weekly

export type ModelProvider = 'openai' | 'google' | 'fireworksai' | 'huggingface' | 'cohere' | 'aws' | 'mistral' | 'groq' | 'perplexity' | 'langchain' | 'anthropic'
    | 'openai-image' | 'huggingface-image' | 'fireworksai-image' | 'deepseek' | 'openrouter'
export const openAiCompatipleProviders:ModelProvider[] = ['openai', 'google', 'fireworksai', 'groq', 'perplexity', 'anthropic', 'mistral', 'deepseek', 'openrouter'] as const

// Declare the internal type to avoid build errors
type ChatModel0 = {
    label: string,
    provider: ModelProvider,
    modelValue: string,
    sdkModelValue: string,
    qualityScore: number,
    japaneseScore: number,
    maxTokens?: number,
    maxCompletionTokens?: number,
    temperature?: number,
    doesSupportTool?: boolean,
    doesAcceptImageUrl?: boolean,
    isDisabled?: boolean,
}

const allModels0:ChatModel0[] = [
    // https://openai.com/api/pricing/
    // in $2/M (cached $0.5/M), out $8/M
    {label: 'OpenAI GPT-4.1', provider: 'openai', modelValue: 'gpt-4.1', sdkModelValue: 'gpt-4.1', qualityScore: 253/256*100, japaneseScore: 77, maxTokens: 4096, doesSupportTool: true, doesAcceptImageUrl: true, },
    // in $0.4/M (cached $0.1/M), out $1.6/M
    {label: 'OpenAI GPT-4.1 mini', provider: 'openai', modelValue: 'gpt-4.1-mini', sdkModelValue: 'gpt-4.1-mini', qualityScore: 253/256*100, japaneseScore: 77, maxTokens: 4096, doesSupportTool: true, doesAcceptImageUrl: true, },
    // in $0.1/M (cached $0.025/M), out $0.4/M
    {label: 'OpenAI GPT-4.1 nano', provider: 'openai', modelValue: 'gpt-4.1-nano', sdkModelValue: 'gpt-4.1-nano', qualityScore: 253/256*100, japaneseScore: 77, maxTokens: 4096, doesSupportTool: true, doesAcceptImageUrl: true, },
    // in $2.5/1M (cached $1.25/M), out $10/1M
    {label: 'OpenAI GPT-4o', provider: 'openai', modelValue: 'gpt-4o', sdkModelValue: 'gpt-4o', qualityScore: 253/256*100, japaneseScore: 77, maxTokens: 4096, doesSupportTool: true, doesAcceptImageUrl: true, },
    // in $0.15/1M, out $0.6/1M
    {label: 'OpenAI GPT-4o-mini', provider: 'openai', modelValue: 'gpt-4o-mini', sdkModelValue: 'gpt-4o-mini', qualityScore: 253/256*100, japaneseScore: 77, maxTokens: 4096, doesSupportTool: true, doesAcceptImageUrl: true, },

    // in $1.1/M (cached $0.55/M), out $4.4/M
    {label: 'OpenAI o4-mini', provider: 'openai', modelValue: 'o4-mini', sdkModelValue: 'o4-mini', qualityScore: 253/256*100, japaneseScore: 77, temperature: 1, maxCompletionTokens: 4096, doesSupportTool: true, doesAcceptImageUrl: true, },
    // in $1.1/M (cached $0.55/M), out $4.4/M
    // AI_APICallError: Unsupported parameter: 'temperature' is not supported with this model. - But temparature:1 works.
    {label: 'OpenAI o3-mini', provider: 'openai', modelValue: 'o3-mini', sdkModelValue: 'o3-mini', qualityScore: 253/256*100, japaneseScore: 77, temperature: 1, maxCompletionTokens: 4096, doesSupportTool: true, doesAcceptImageUrl: true, },
    // shutdown: October 27, 2025in $1.1/M (cached $0.55), out $4.4/M
    {label: 'OpenAI o1-mini', provider: 'openai', modelValue: 'o1-mini', sdkModelValue: 'o1-mini', qualityScore: 253/256*100, japaneseScore: 77, temperature: 1, maxCompletionTokens: 4096, doesSupportTool: true, doesAcceptImageUrl: true, },
    
    // in $10/M (cached $2.5), out $40/M
    {label: 'OpenAI o3', provider: 'openai', modelValue: 'o3', sdkModelValue: 'o3', qualityScore: 253/256*100, japaneseScore: 77, temperature: 1, maxCompletionTokens: 4096, doesSupportTool: true, doesAcceptImageUrl: true, isDisabled: true, },
    // in $15.00/M (cached $7.50/M), out $60.00/M
    {label: 'OpenAI o1', provider: 'openai', modelValue: 'o1', sdkModelValue: 'o1', qualityScore: 253/256*100, japaneseScore: 77, temperature: 1, doesSupportTool: true, doesAcceptImageUrl: true, isDisabled: true, },
    // in $150/M, out $600.00/M
    {label: 'OpenAI o1-pro', provider: 'openai', modelValue: 'o1-pro', sdkModelValue: 'o1-pro', qualityScore: 253/256*100, japaneseScore: 77, temperature: 1, doesSupportTool: true, doesAcceptImageUrl: true, isDisabled: true, },
    // in $75/M (cached $37.5/M) out $150/M
    {label: 'OpenAI GPT-4.5 Preview', provider: 'openai', modelValue: 'gpt-4.5-preview', sdkModelValue: 'gpt-4.5-preview', qualityScore: 253/256*100, japaneseScore: 77, maxTokens: 4096, doesSupportTool: true, doesAcceptImageUrl: true, isDisabled: true, },
    // // in $0.03/1K tokens, out $0.06/1K tokens
    // {label: 'OpenAI GPT-4', provider: 'openai', modelValue: 'gpt-4', sdkModelValue: 'gpt-4', qualityScore: 254/256*100, japaneseScore: 76, doesSupportTool: true,},
    // in $10/M tokens, out $30/M tokens 
    {label: 'OpenAI GPT-4 Turbo', provider: 'openai', modelValue: 'gpt-4-turbo', sdkModelValue: 'gpt-4-turbo', qualityScore: 253/256*100, japaneseScore: 77, maxTokens: 4096, doesSupportTool: true, doesAcceptImageUrl: true, isDisabled: true, },
    // in $5/M, out $15/M
    {label: 'OpenAI ChatGPT-4o', provider: 'openai', modelValue: 'chatgpt-4o-latest', sdkModelValue: 'chatgpt-4o-latest', qualityScore: 253/256*100, japaneseScore: 77, maxTokens: 4096, doesSupportTool: true, doesAcceptImageUrl: true, isDisabled: true, },
    // in $0.5/M tokens, out $1.5/M tokens
    {label: 'OpenAI GPT-3.5', provider: 'openai', modelValue: 'gpt-3.5-turbo', sdkModelValue: 'gpt-3.5-turbo', qualityScore: 118/256*100, japaneseScore: 67, doesSupportTool: true,},

    // https://ai.google.dev/gemini-api/docs/pricing
    // in $1.25/M, out $10/M after free tier
    {label: 'Google Gemini 2.5 Pro', provider: 'google', modelValue: 'gemini-2.5-pro', sdkModelValue: 'models/gemini-2.5-pro-exp-03-25', qualityScore: 122/256*100, japaneseScore: 64},
    // in $0.15/M, out $3.5/M after free tier
    {label: 'Google Gemini 2.5 Flash', provider: 'google', modelValue: 'gemini-2.5-flash', sdkModelValue: 'models/gemini-2.5-flash-preview-04-17', qualityScore: 122/256*100, japaneseScore: 64},
    // in $0.1/M, out $0.4/M after free tier
    {label: 'Google Gemini 2.0 Flash', provider: 'google', modelValue: 'gemini-2.0-flash', sdkModelValue: 'models/gemini-2.0-flash', qualityScore: 122/256*100, japaneseScore: 64},
    // in $1.25/M, out $5/M
    {label: 'Google Gemini 1.5 Pro', provider: 'google', modelValue: 'gemini-1.5-pro-latest', sdkModelValue: 'models/gemini-1.5-pro-latest', qualityScore: 122/256*100, japaneseScore: 64},
    // in $0.075/M, out $0.3
    {label: 'Google Gemini 1.5 Flash', provider: 'google', modelValue: 'gemini-1.5-flash-latest', sdkModelValue: 'models/gemini-1.5-flash-latest', qualityScore: 122/256*100, japaneseScore: 64},
    {label: 'Google Gemini Pro Vision', provider: 'google', modelValue: 'gemini-pro-vision', sdkModelValue: 'models/gemini-pro-vision', qualityScore: 218/256*100, japaneseScore: 64, doesAcceptImageUrl: true, },

    // in $15/M, out $75/M
    {label: 'Anthropic Claude 3 Opus (OpenRouter)', provider: 'openrouter', modelValue: 'claude-3-opus', sdkModelValue: 'anthropic/claude-3-opus', qualityScore: 255/256*100, japaneseScore:64, maxTokens: 4096, doesSupportTool: true, doesAcceptImageUrl: true, isDisabled: true, },
    // in $3/M, out $15/M
    {label: 'Anthropic Claude 3.5 Sonnet (OpenRouter)', provider: 'openrouter', modelValue: 'claude-3.5-sonnet', sdkModelValue: 'anthropic/claude-3.5-sonnet', qualityScore: 254/256*100, japaneseScore:64, maxTokens: 4096, doesSupportTool: true, doesAcceptImageUrl: true, },
    // in $0.25/M, out $1.25/M
    {label: 'Anthropic Claude 3 Haiku (OpenRouter)', provider: 'openrouter', modelValue: 'claude-3-haiku', sdkModelValue: 'anthropic/claude-3-haiku', qualityScore: 119/256*100, japaneseScore:63, maxTokens: 4096, doesSupportTool: true, doesAcceptImageUrl: true, },
    
    // https://www.anthropic.com/pricing#anthropic-api
    // We cannot pay for the anthropic credit for some reason. Disabling models
    // in $15.00 / out $75.00 /1M tokens
    // {label: 'Anthropic Claude 3 Opus', provider: 'anthropic', modelValue: 'claude-3-opus-20240229', sdkModelValue: 'claude-3-opus-20240229', qualityScore: 255/256*100, japaneseScore:64, maxTokens: 4096, doesSupportTool: true, doesAcceptImageUrl: true, isDisabled: true, },
    // in $3.00 / out $15.00 /1M tokens
    // {label: 'Anthropic Claude 3 Sonnet', provider: 'anthropic', modelValue: 'claude-3-sonnet-20240229', sdkModelValue: 'claude-3-sonnet-20240229', qualityScore: 254/256*100, japaneseScore:64, maxTokens: 4096, doesSupportTool: true, doesAcceptImageUrl: true, isDisabled: true, },
    // in $0.25 / out $1.25 /1M tokens
    // {label: 'Anthropic Claude 3 Haiku', provider: 'anthropic', modelValue: 'claude-3-haiku-20240307', sdkModelValue: 'claude-3-haiku-20240307', qualityScore: 119/256*100, japaneseScore:63, maxTokens: 4096, doesSupportTool: true, doesAcceptImageUrl: true, isDisabled: true, },
    // no longer necessary. Claude 3 is cheeper and better
    // in $0.008/1k tokens, out $0.024/1k tokens
    // {label: 'Anthropic Claude 2.1', provider: 'aws', modelValue: 'anthropic.claude-v2', sdkModelValue: 'anthropic.claude-v2:1', qualityScore: 120/256*100, japaneseScore:67},
    // // in $0.0008/1k tokens, out $0.0024/1k tokens
    // {label: 'Anthropic Claude Instant', provider: 'aws', modelValue: 'anthropic.claude-instant-v1', sdkModelValue: 'anthropic.claude-instant-v1', qualityScore: 150/256*100, japaneseScore:64}, // fast
    
    // https://cohere.com/pricing
    // https://docs.cohere.com/docs/command-r7b
    // // in: $2.5/M, out: $10/M
    // {label: 'Cohere Command A', provider: 'cohere', modelValue: 'command-a', sdkModelValue: 'command-a-03-2025', qualityScore: 148/256*100, japaneseScore:67},
    // // in: $0.0375/M, out: $0.1/M
    // {label: 'Cohere Command R7B', provider: 'cohere', modelValue: 'command-r7b-12-2024', sdkModelValue: 'command-r7b-12-2024', qualityScore: 148/256*100, japaneseScore:67},
    // in: $2.5/M, out: $10/M
    {label: 'Cohere Command R+ 08-2024', provider: 'cohere', modelValue: 'command-r-plus-08-2024', sdkModelValue: 'command-r-plus-08-2024', qualityScore: 148/256*100, japaneseScore:67},
    // in: $0.15/M, out: $0.60/M
    {label: 'Cohere Command R 08-2024', provider: 'cohere', modelValue: 'command-r-08-2024', sdkModelValue: 'command-r-08-2024', qualityScore: 40, japaneseScore:0}, // does not work
    // in: $2.5/M, out: $10/M
    {label: 'Cohere Command R+', provider: 'cohere', modelValue: 'command-r-plus', sdkModelValue: 'command-r-plus', qualityScore: 147/256*100, japaneseScore:67},
    // command-r7b-12-2024 does not work
    // in: $0.0375/M, out: $0.15/M
    // {label: 'Cohere Command R7B 12-2024', provider: 'cohere', modelValue: 'command-r7b-12-2024', sdkModelValue: 'command-r7b-12-2024', qualityScore: 148/256*100, japaneseScore:67},
    // {label: 'Cohere Command R', provider: 'cohere', modelValue: 'command-r', sdkModelValue: 'command-r', qualityScore: 40, japaneseScore:0}, // does not work

    // in $3/M, out: $8/M
    {label: 'DeepSeek R1', provider: 'fireworksai', modelValue: 'deepseek-r1', sdkModelValue: 'accounts/fireworks/models/deepseek-r1', qualityScore: 111/256*100, japaneseScore:50},
    // $0.9/M
    {label: 'DeepSeek V3', provider: 'fireworksai', modelValue: 'deepseek-v3', sdkModelValue: 'accounts/fireworks/models/deepseek-v3', qualityScore: 111/256*100, japaneseScore:30},

    // $0.1/M
    {label: 'Meta Llama 3.3 70B Instruct', provider: 'fireworksai', modelValue: 'llama-v3p3-70b-instruct', sdkModelValue: 'accounts/fireworks/models/llama-v3p3-70b-instruct', qualityScore: 33, japaneseScore:15, doesAcceptImageUrl: true, },
    // $3/M
    {label: 'Yi-Large', provider: 'fireworksai', modelValue: 'yi-large', sdkModelValue: 'accounts/yi-01-ai/models/yi-large', qualityScore: 111/256*100, japaneseScore:5},
    // $3/1M in/out tokens
    {label: 'Meta Llama 3.1 405B', provider: 'fireworksai', modelValue: 'llama-v3p1-405b-instruct', sdkModelValue: 'accounts/fireworks/models/llama-v3p1-405b-instruct', qualityScore: 33, japaneseScore:15, doesAcceptImageUrl: true, },

    // in: $2/M, out: $8/M
    {label: 'Perplexity Sonar Reasoning Pro', provider: 'perplexity', modelValue: 'sonar-reasoning-pro', sdkModelValue: 'sonar-reasoning-pro', qualityScore: 61, japaneseScore:0},
    // in: $1/M, out: $5/M
    {label: 'Perplexity Sonar Reasoning', provider: 'perplexity', modelValue: 'sonar-reasoning', sdkModelValue: 'sonar-reasoning', qualityScore: 61, japaneseScore:0},
    // in: $3/M, out: $15/M
    {label: 'Perplexity Sonar Pro', provider: 'perplexity', modelValue: 'sonar-pro', sdkModelValue: 'sonar-pro', qualityScore: 61, japaneseScore:0},
    // in: $1/M, out: $1/M
    {label: 'Perplexity Sonar', provider: 'perplexity', modelValue: 'sonar', sdkModelValue: 'sonar', qualityScore: 61, japaneseScore:0},

    // https://docs.mistral.ai/getting-started/models/models_overview/
    // https://mistral.ai/en/products/la-plateforme#pricing    
    // in: $2, out: $6
    {label: 'Mistral Large', provider: 'mistral', modelValue: 'mistral-large', sdkModelValue: 'mistral-large-latest', qualityScore: 152+1/256*100, japaneseScore:50+1},
    // in: $0.3, out: $0.9
    {label: 'Mistral Codestral', provider: 'mistral', modelValue: 'codestral-latest', sdkModelValue: 'codestral-latest', qualityScore: 40, japaneseScore:52},

    // https://console.groq.com/docs/models
    {label: 'Groq DeepSeek Qwen 32B', provider: 'groq', modelValue: 'deepseek-r1-distill-qwen-32b', sdkModelValue: 'deepseek-r1-distill-qwen-32b', qualityScore: 198/256*100+2, japaneseScore:5},
    {label: 'Groq DeepSeek Llama 70B', provider: 'groq', modelValue: 'deepseek-r1-distill-llama-70b', sdkModelValue: 'deepseek-r1-distill-llama-70b', qualityScore: 198/256*100+2, japaneseScore:5},
    {label: 'Groq Llama 3 70b', provider: 'groq', modelValue: 'groq-llama3-70b-8192', sdkModelValue: 'llama3-70b-8192', qualityScore: 198/256*100+2, japaneseScore:5},
    // $0.59/$0.79 1M
    {label: 'Groq Llama 3.1 70b', provider: 'groq', modelValue: 'groq-llama-3.1-70b-versatile', sdkModelValue: 'llama-3.1-70b-versatile', qualityScore: 198/256*100+2, japaneseScore:5},
    // $0.05/$0.08 1M
    {label: 'Groq Llama 3.1 8b', provider: 'groq', modelValue: 'groq-llama-3.1-8b-instant', sdkModelValue: 'llama-3.1-8b-instant', qualityScore: 137/256*100+2, japaneseScore:5},
    // $0.2/$0.2 /1M
    // {label: 'Groq Gemma2 9b It', provider: 'groq', modelValue: 'groq-gemma2-9b-it', sdkModelValue: 'gemma2-9b-it', qualityScore: 137/256*100+2, japaneseScore:5},

    // Hugging Face free account
    {label: 'Gemma 2 27B It', provider: 'huggingface', modelValue: 'gemma-2-27b-it', sdkModelValue: 'google/gemma-2-27b-it', qualityScore: 86/256*100-3, japaneseScore:0},
    {label: 'Gemma 2 9B It', provider: 'huggingface', modelValue: 'gemma-2-9b-it', sdkModelValue: 'google/gemma-2-9b-it', qualityScore: 86/256*100-3, japaneseScore:0},
    {label: 'Gemma 2 2B It', provider: 'huggingface', modelValue: 'gemma-2-2b-it', sdkModelValue: 'google/gemma-2-2b-it', qualityScore: 86/256*100-3, japaneseScore:0},

    {label: 'Gemma 1.1 7B Instruct', provider: 'huggingface', modelValue: 'gemma-1.1-7b-it', sdkModelValue: 'google/gemma-1.1-7b-it', qualityScore: 86/256*100, japaneseScore:10},
    {label: 'Gemma 1.1 2B Instruct', provider: 'huggingface', modelValue: 'gemma-1.1-2b-it', sdkModelValue: 'google/gemma-1.1-2b-it', qualityScore: 86/256*100-1, japaneseScore:0},
    {label: 'Gemma 7B', provider: 'huggingface', modelValue: 'gemma-7b', sdkModelValue: 'google/gemma-7b', qualityScore: 86/256*100-2, japaneseScore:10},
    {label: 'Gemma 2B', provider: 'huggingface', modelValue: 'gemma-2b', sdkModelValue: 'google/gemma-2b', qualityScore: 86/256*100-3, japaneseScore:0},

    {label: 'Groq Llama 3 8b', provider: 'groq', modelValue: 'groq-llama3-8b-8192', sdkModelValue: 'llama3-8b-8192', qualityScore: 137/256*100+2, japaneseScore:5},
    {label: 'Groq Mixtral 8x7b', provider: 'groq', modelValue: 'groq-Mixtral-8x7b-Instruct-v0.1', sdkModelValue: 'mixtral-8x7b-32768', qualityScore: 152/256*100+1, japaneseScore:5},
    {label: 'Groq Llama 2 70B Chat', provider: 'groq', modelValue: 'groq-LLaMA2-70b-chat', sdkModelValue: 'llama2-70b-4096', qualityScore: 82/256*100+2, japaneseScore:5},

    // $0.9/M
    {label: 'Qwen2.5 72B Instruct', provider: 'fireworksai', modelValue: 'qwen2p5-72b-instruct', sdkModelValue: 'accounts/fireworks/models/qwen2p5-72b-instruct', qualityScore: 147/256*100, japaneseScore:20},

    // $1.2/M
    {label: 'Mixtral 8x22B Instruct', provider: 'fireworksai', modelValue: 'mixtral-8x22b-instruct', sdkModelValue: 'accounts/fireworks/models/mixtral-8x22b-instruct', qualityScore: 120/256*100, japaneseScore:50},
    // $0.2/M
    {label: 'Mixtral MoE 8x7B Instruct', provider: 'fireworksai', modelValue: 'mixtral-8x7b-instruct', sdkModelValue: 'accounts/fireworks/models/mixtral-8x7b-instruct', qualityScore: 120/256*100, japaneseScore:5},
    // in 2.5€/M, out 7.5€/M
    {label: 'Mistral Medium', provider: 'mistral', modelValue: 'mistral-medium', sdkModelValue: 'mistral-medium', qualityScore: 152/256*100, japaneseScore:20},
    {label: 'Mistral Small', provider: 'mistral', modelValue: 'mistral-small', sdkModelValue: 'mistral-small', qualityScore: 40, japaneseScore:5},
    // in 0.14€/M, out 0.42€/M
    {label: 'Mistral Tiny', provider: 'mistral', modelValue: 'mistral-tiny', sdkModelValue: 'mistral-tiny', qualityScore: 40, japaneseScore:10},
    {label: 'Mistral 7B Instruct', provider: 'fireworksai', modelValue: 'mistral-7b-instruct-4k', sdkModelValue: 'accounts/fireworks/models/mistral-7b-instruct-4k', qualityScore: 152/256*100, japaneseScore:0},

    {label: 'Cohere Command Nightly', provider: 'cohere', modelValue: 'cohere-command-nightly', sdkModelValue: 'command-nightly', qualityScore: 40, japaneseScore:0},
    {label: 'Cohere Command Light Nightly', provider: 'cohere', modelValue: 'cohere-command-light-nightly', sdkModelValue: 'command-light-nightly', qualityScore: 40, japaneseScore:0},

    {label: 'Open-Assistant SFT-4 12B', provider: 'huggingface', modelValue: 'oasst-sft-4-pythia-12b-epoch-3.5', sdkModelValue: 'OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5', qualityScore: 40, japaneseScore:0},
    // free. very low quality
    // {label: 'Japanese Stable LM Instruct Gamma 7B', provider: 'fireworksai', modelValue: 'japanese-stablelm-instruct-gamma-7b', sdkModelValue: 'accounts/stability/models/japanese-stablelm-instruct-gamma-7b', qualityScore: 40, japaneseScore:20}, // only work with 1 or 2 messages
    {label: 'StableLM Zephyr 3B', provider: 'fireworksai', modelValue: 'stablelm-zephyr-3b', sdkModelValue: 'accounts/stability/models/stablelm-zephyr-3b', qualityScore: 40, japaneseScore:0},

    // Vercel AI SDK for AWS supports Claude body format (prompt) but not titan (inputText)
    // {label: 'Titan Text G1 - Express', provider: 'aws', modelValue: 'amazon.titan-text-express-v1', sdkModelValue: 'amazon.titan-text-express-v1', recommendScore:20},  

    // Image generation - Works fine, but UI should be updated
    {label: 'DALL·E 3', provider: 'openai-image', modelValue: 'dall-e-3', sdkModelValue: 'dall-e-3', qualityScore: 40, japaneseScore:40},
    {label: 'DALL·E 2', provider: 'openai-image', modelValue: 'dall-e-2', sdkModelValue: 'dall-e-2', qualityScore: 40, japaneseScore:10},
    {label: 'Stable Diffusion 2', provider: 'huggingface-image', modelValue: 'stable-diffusion-2', sdkModelValue: 'stabilityai/stable-diffusion-2', qualityScore: 40, japaneseScore:10},

    // AI_APICallError "Not Found"
    // {label: 'Japanese StableLM 2 Instruct 1.6B', provider: 'huggingface', modelValue: 'stabilityai/japanese-stablelm-2-instruct-1_6b', sdkModelValue: 'stabilityai/japanese-stablelm-2-instruct-1_6b', qualityScore: 40, japaneseScore:37},
    // AI_APICallError "Not Found"
    // {label: 'Japanese StableLM Instruct Beta 70B', provider: 'fireworksai', modelValue: 'japanese-stablelm-instruct-beta-70b', sdkModelValue: 'accounts/stability/models/japanese-stablelm-instruct-beta-70b', qualityScore: 40, japaneseScore:37},

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
    maxCompletionTokens?: number, // deprecating maxTokens https://platform.openai.com/docs/api-reference/debugging-requests
    temperature?: number,
    doesToolSupport?: boolean, // If the model supports tools and function calls
    doesAcceptImageUrl?: boolean,
    isDisabled?: boolean, // technically possible but do not let the user choose the model
}


export const allModels:ChatModel[] = allModels0 as any
// fall back free model.
export const DEFAULT_MODEL:ChatModel = allModels.find(model => model.modelValue === 'gemma-2-27b-it') as ChatModel

export const allModelValues = allModels0.map(model => model.modelValue);


// models which are choosable with the selection
export const selectableModels:ChatModel[] = allModels.filter((modelData) => {
    // currently all models are selectable
    return modelData.japaneseScore >= 0
})

// from all models
export function getModelByValue(modelValue:ModelValue):ChatModel | undefined {
    return allModels.find((value) => value.modelValue === modelValue)
}
