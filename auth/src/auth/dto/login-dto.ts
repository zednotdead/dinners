import { z } from 'zod/v4';

export const LoginDTO = z.object({
  email: z.email().nonoptional(),
  password: z.string().nonoptional(),
});

export type LoginDTOType = z.infer<typeof LoginDTO>;
