import { z } from "zod/v4";

export const BaseMessageDTO = z.object({
    message: z.string()
})

export type BaseMessageDTOType = z.infer<typeof BaseMessageDTO>
