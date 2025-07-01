import { z } from "zod/v4";
import zx from "zxcvbn"

export const CreateUserDTO = z.object({
    username: z.string().min(3, "Username cannot be less than 3 characters long"),
    email: z.email().nonempty(),
    password: z.string().nonempty().refine((password) => zx(password).score > 2, { error: "Password is too weak." })
})

export type CreateUserDTOType = z.infer<typeof CreateUserDTO>
