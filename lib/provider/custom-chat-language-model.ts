import {
    LanguageModelV1,
    LanguageModelV1CallWarning,
    LanguageModelV1FinishReason,
    LanguageModelV1StreamPart,
    UnsupportedFunctionalityError,
} from '@ai-sdk/provider';
import {
    ParseResult,
    createEventSourceResponseHandler,
    createJsonResponseHandler,
    postJsonToApi,
} from '@ai-sdk/provider-utils';
import { z } from 'zod';
import { convertToCustomChatMessages } from './convert-to-custom-chat-messages';
import { mapCustomFinishReason } from './map-custom-finish-reason';
import {
    CustomChatModelId,
    CustomChatSettings,
} from './custom-chat-settings';
import { customFailedResponseHandler } from './custom-error';

type CustomChatConfig = {
    provider: string;
    baseURL: string;
    headers: () => Record<string, string | undefined>;
    generateId: () => string;
};

export class CustomChatLanguageModel implements LanguageModelV1 {
    readonly specificationVersion = 'v1';
    readonly defaultObjectGenerationMode = 'json';

    readonly modelId: CustomChatModelId;
    readonly settings: CustomChatSettings;

    private readonly config: CustomChatConfig;

    constructor(
        modelId: CustomChatModelId,
        settings: CustomChatSettings,
        config: CustomChatConfig,
    ) {
        this.modelId = modelId;
        this.settings = settings;
        this.config = config;
    }

    get provider(): string {
        return this.config.provider;
    }

    private getArgs({
        mode,
        prompt,
        maxTokens,
        temperature,
        topP,
        frequencyPenalty,
        presencePenalty,
        seed,
    }: Parameters<LanguageModelV1['doGenerate']>[0]) {
        const type = mode.type;

        const warnings: LanguageModelV1CallWarning[] = [];

        if (frequencyPenalty != null) {
            warnings.push({
                type: 'unsupported-setting',
                setting: 'frequencyPenalty',
            });
        }

        if (presencePenalty != null) {
            warnings.push({
                type: 'unsupported-setting',
                setting: 'presencePenalty',
            });
        }

        if (maxTokens != null) {
            warnings.push({
                type: 'unsupported-setting',
                setting: 'maxTokens',
            })
        }
        if (temperature != null) {
            warnings.push({
                type: 'unsupported-setting',
                setting: 'temperature',
            })
        }
        if (topP != null) {
            warnings.push({
                type: 'unsupported-setting',
                setting: 'topP',
            })
        }
        if (seed != null) {
            warnings.push({
                type: 'unsupported-setting',
                setting: 'seed',
            })
        }

        const baseArgs = {
            // model id:
            model: this.modelId,

            // standardized settings:
            // max_tokens: maxTokens,
            // temperature, // uses 0..1 scale
            // top_p: topP,
            // random_seed: seed,

            // messages:
            messages: convertToCustomChatMessages(prompt),
        };

        switch (type) {
            case 'regular': {
                // when the tools array is empty, change it to undefined to prevent OpenAI errors:
                const tools = mode.tools?.length ? mode.tools : undefined;

                return {
                    args: {
                        ...baseArgs,
                        tools: tools?.map((tool:any) => ({
                            type: 'function',
                            function: {
                                name: tool.name,
                                description: tool.description,
                                parameters: tool.parameters,
                            },
                        })),
                    },
                    warnings,
                };
            }

            case 'object-json': {
                return {
                    args: {
                        ...baseArgs,
                        response_format: { type: 'json_object' },
                    },
                    warnings,
                };
            }

            case 'object-tool': {
                return {
                    args: {
                        ...baseArgs,
                        tool_choice: 'any',
                        tools: [{ type: 'function', function: mode.tool }],
                    },
                    warnings,
                };
            }

            // case 'object-grammar': {
            //     throw new UnsupportedFunctionalityError({
            //         functionality: 'object-grammar mode',
            //     });
            // }

            default: {
                const _exhaustiveCheck: never = type;
                throw new Error(`Unsupported type: ${_exhaustiveCheck}`);
            }
        }
    }

    async doGenerate(
        options: Parameters<LanguageModelV1['doGenerate']>[0],
    ): Promise<Awaited<ReturnType<LanguageModelV1['doGenerate']>>> {
        const { args, warnings } = this.getArgs(options);

        const response = await postJsonToApi({
            url: `${this.config.baseURL}/chat/completions`,
            headers: this.config.headers(),
            body: args,
            failedResponseHandler: customFailedResponseHandler,
            successfulResponseHandler: createJsonResponseHandler(
                customChatResponseSchema,
            ),
            abortSignal: options.abortSignal,
        });

        const { messages: rawPrompt, ...rawSettings } = args;
        const choice = response.choices[0];

        return {
            text: choice.message.content ?? undefined,
            toolCalls: choice.message.tool_calls?.map(toolCall => ({
                toolCallType: 'function',
                toolCallId: this.config.generateId(),
                toolName: toolCall.function.name,
                args: toolCall.function.arguments!,
            })),
            finishReason: mapCustomFinishReason(choice.finish_reason),
            usage: {
                promptTokens: response.usage.prompt_tokens,
                completionTokens: response.usage.completion_tokens,
            },
            rawCall: { rawPrompt, rawSettings },
            warnings,
        };
    }

    async doStream(
        options: Parameters<LanguageModelV1['doStream']>[0],
    ): Promise<Awaited<ReturnType<LanguageModelV1['doStream']>>> {
        const { args, warnings } = this.getArgs(options);

        const response = await postJsonToApi({
            url: `${this.config.baseURL}/chat/completions`,
            headers: this.config.headers(),
            body: {
                ...args,
                stream: true,
            },
            failedResponseHandler: customFailedResponseHandler,
            successfulResponseHandler: createEventSourceResponseHandler(
                customChatChunkSchema,
            ),
            abortSignal: options.abortSignal,
        });

        const { messages: rawPrompt, ...rawSettings } = args;

        let finishReason: LanguageModelV1FinishReason = 'other';
        let usage: { promptTokens: number; completionTokens: number } = {
            promptTokens: Number.NaN,
            completionTokens: Number.NaN,
        };

        const generateId = this.config.generateId;

        return {
            stream: response.pipeThrough(
                new TransformStream<
                    ParseResult<z.infer<typeof customChatChunkSchema>>,
                    LanguageModelV1StreamPart
                >({
                    transform(chunk, controller) {
                        if (!chunk.success) {
                            controller.enqueue({ type: 'error', error: chunk.error });
                            return;
                        }

                        const value = chunk.value;

                        if (value.usage != null) {
                            usage = {
                                promptTokens: value.usage.prompt_tokens,
                                completionTokens: value.usage.completion_tokens,
                            };
                        }

                        const choice = value.choices[0];

                        if (choice?.finish_reason != null) {
                            finishReason = mapCustomFinishReason(choice.finish_reason);
                        }

                        if (choice?.delta == null) {
                            return;
                        }

                        const delta = choice.delta;

                        if (delta.content != null) {
                            controller.enqueue({
                                type: 'text-delta',
                                textDelta: delta.content,
                            });
                        }

                        if (delta.tool_calls != null) {
                            for (const toolCall of delta.tool_calls) {
                                // tool calls come in one piece

                                const toolCallId = generateId(); // delta and tool call must have same id

                                controller.enqueue({
                                    type: 'tool-call-delta',
                                    toolCallType: 'function',
                                    toolCallId,
                                    toolName: toolCall.function.name,
                                    argsTextDelta: toolCall.function.arguments,
                                });

                                controller.enqueue({
                                    type: 'tool-call',
                                    toolCallType: 'function',
                                    toolCallId,
                                    toolName: toolCall.function.name,
                                    args: toolCall.function.arguments,
                                });
                            }
                        }
                    },

                    flush(controller) {
                        controller.enqueue({ type: 'finish', finishReason, usage });
                    },
                }),
            ),
            rawCall: { rawPrompt, rawSettings },
            warnings,
        };
    }
}

// limited version of the schema, focussed on what is needed for the implementation
// this approach limits breakages when the API changes and increases efficiency
const customChatResponseSchema = z.object({
    choices: z.array(
        z.object({
            message: z.object({
                role: z.literal('assistant'),
                content: z.string().nullable(),
                tool_calls: z
                    .array(
                        z.object({
                            function: z.object({
                                name: z.string(),
                                arguments: z.string(),
                            }),
                        }),
                    )
                    .optional()
                    .nullable(),
            }),
            index: z.number(),
            finish_reason: z.string().optional().nullable(),
        }),
    ),
    object: z.literal('chat.completion'),
    usage: z.object({
        prompt_tokens: z.number(),
        completion_tokens: z.number(),
    }),
});

// limited version of the schema, focussed on what is needed for the implementation
// this approach limits breakages when the API changes and increases efficiency
const customChatChunkSchema = z.object({
    object: z.literal('chat.completion.chunk'),
    choices: z.array(
        z.object({
            delta: z.object({
                role: z.enum(['assistant']).optional(),
                content: z.string().nullable().optional(),
                tool_calls: z
                    .array(
                        z.object({
                            function: z.object({ name: z.string(), arguments: z.string() }),
                        }),
                    )
                    .optional()
                    .nullable(),
            }),
            finish_reason: z.string().nullable().optional(),
            index: z.number(),
        }),
    ),
    usage: z
        .object({
            prompt_tokens: z.number(),
            completion_tokens: z.number(),
        })
        .optional()
        .nullable(),
});
