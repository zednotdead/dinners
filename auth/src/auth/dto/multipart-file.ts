import { type BusboyFileStream } from '@fastify/busboy';
import { z } from 'zod/v4';

export const MultipartFile = z.object({
  file: z.custom<BusboyFileStream>(),
  metadata: z.object({
    filename: z.string(),
    mimetype: z.string(),
  }),
});

export type MultipartFileType = z.infer<typeof MultipartFile>;
