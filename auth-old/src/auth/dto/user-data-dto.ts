import { z } from 'zod/v4';

export const UserDataDTO = z.object({
  id: z.string().nonempty(),
  username: z.string().min(3, 'Username cannot be less than 3 characters long'),
  email: z.email().nonempty(),
  avatar: z.string().optional().nullable(),
});

export type UserDataDTOType = z.infer<typeof UserDataDTO>;
