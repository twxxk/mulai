import { createJsonErrorResponseHandler } from '@ai-sdk/provider-utils';
import { z } from 'zod';

const customErrorDataSchema = z.object({
  object: z.literal('error'),
  message: z.string(),
  type: z.string(),
  param: z.string().nullable(),
  code: z.string().nullable(),
});

export type CustomErrorData = z.infer<typeof customErrorDataSchema>;

export const customFailedResponseHandler = createJsonErrorResponseHandler({
  errorSchema: customErrorDataSchema,
  errorToMessage: data => data.message,
});
