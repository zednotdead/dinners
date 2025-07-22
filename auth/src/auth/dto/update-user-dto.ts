import { z } from 'zod/v4';

export const UpdateUserDTO = z.object({
  avatar: z.string().optional().nullable(),
  username: z.string().optional(),
});

export type UpdateUserDTOType = z.infer<typeof UpdateUserDTO>;
