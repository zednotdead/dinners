import { z } from 'zod/v4';
import { MultipartFile } from './multipart-file';

export const UpdateUserDTO = z.object({
  avatar: z.union([
    MultipartFile,
    z.literal(''),
  ]).optional().nullable(),
  username: z.string().optional(),
});

export type UpdateUserDTOType = z.infer<typeof UpdateUserDTO>;
