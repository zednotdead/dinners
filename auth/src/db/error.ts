import { BaseError } from "../errors/base";

export enum DatabaseErrorCode {
    UNIQUE_VIOLATION,
    UNKNOWN
}

export class DatabaseError extends BaseError {
    public constraint?: string;
    public table: string = "";
    public type: DatabaseErrorCode = DatabaseErrorCode.UNKNOWN

    constructor(error: unknown) {
        if (!(error instanceof Error)) {
            super(500, error as string)
            return;
        }

        super(500, error.message)

        if (error.cause instanceof Object) {
            if ("code" in error.cause && typeof error.cause.code === "string") {
                this.type = this.mapCodeToType(error.cause.code)
            }
            if ("table" in error.cause && typeof error.cause.table === "string") {
                this.table = error.cause.table
            }
        }
    }

    private mapCodeToType(code: string): DatabaseErrorCode {
        switch (code) {
            case '23505':
                return DatabaseErrorCode.UNIQUE_VIOLATION
            default:
                return DatabaseErrorCode.UNKNOWN
        }
    }
}

