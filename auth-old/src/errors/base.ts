import { z } from 'zod/v4';

export const BaseErrorDTO = z.object({
  code: z.number().positive(),
  message: z.string(),
});

export class BaseError extends Error {
  constructor(
    public statusCode: number,
    public override message: string,
  ) {
    super(message);
  }

  public getResponse() {
    return {
      code: this.statusCode,
      message: this.message,
    };
  }
}
