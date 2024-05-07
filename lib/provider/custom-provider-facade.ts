import { generateId, loadApiKey, withoutTrailingSlash } from '@ai-sdk/provider-utils';
import { CustomChatLanguageModel } from './custom-chat-language-model';
import { CustomChatModelId, CustomChatSettings } from './custom-chat-settings';
 
/**
 * Custom provider facade.
 */
export class CustomProvider {
  readonly baseURL: string;
  readonly apiKey?: string;
 
  constructor(
    options: {
      baseURL?: string;
      apiKey?: string;
    } = {},
  ) {
    this.baseURL = withoutTrailingSlash(options.baseURL) ??
      'https://api.custom.ai/v1';
    this.apiKey = options.apiKey;
  }
 
  private get baseConfig() {
    return {
      baseURL: this.baseURL,
      headers: () => ({
        Authorization: `Bearer ${loadApiKey({
          apiKey: this.apiKey,
          environmentVariableName: 'CUSTOM_API_KEY',
          description: 'Custom Provider',
        })}`,
      }),
    };
  }
 
  chat(modelId: CustomChatModelId, settings: CustomChatSettings = {}) {
    return new CustomChatLanguageModel(modelId, settings, {
      provider: 'custom.chat',
      ...this.baseConfig,
      generateId,
    });
  }
}
 
/**
 * Default custom provider instance.
 */
export const customprovider = new CustomProvider();
