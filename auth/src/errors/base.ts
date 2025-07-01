import { z } from "zod/v4";

export const BaseErrorDTO = z.object({
    code: z.number().positive(),
    message: z.string(),
})

export class BaseError {
    constructor(
        public statusCode: number,
        public message: string,
    ) {}

    public getResponse() {
        return {
            code: this.statusCode,
            message: this.message,
        }
    }
}
