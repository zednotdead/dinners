import { z } from "zod/v4";

export const LoginDTO = z.object({
    email: z.email().nonoptional(),
    password: z.string().nonoptional()
})
