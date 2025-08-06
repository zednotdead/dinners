import { z } from 'zod/v4';

export const LoginResponseDTO = z.object({
  access_token: z.jwt(),
});

export type LoginResponseDTOType = z.infer<typeof LoginResponseDTO>;
