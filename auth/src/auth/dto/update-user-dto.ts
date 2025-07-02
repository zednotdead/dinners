import { type BusboyFileStream } from '@fastify/busboy';
import { z } from 'zod/v4';

export const UpdateUserDTO = z.object({
  avatar: z.custom<BusboyFileStream>().optional(),
});

export type UpdateUserDTOType = z.infer<typeof UpdateUserDTO>;
