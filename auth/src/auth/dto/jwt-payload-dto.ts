import { z } from "zod/v4";

export const JWTPayloadDTO = z.object({
    id: z.string().nonempty(),
    username: z.string().min(3, "Username cannot be less than 3 characters long"),
})

export type JWTPayloadDTOType = z.infer<typeof JWTPayloadDTO>

declare module '@fastify/jwt' {
  interface FastifyJWT {
    user: JWTPayloadDTOType
  }
}
