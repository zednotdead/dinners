import type { MultipartFields } from "@fastify/multipart";
import { pipeline } from 'node:stream/promises';
import { createWriteStream } from "node:fs";
import { UpdateUserDTO, type UpdateUserDTOType } from "./dto/update-user-dto";
import { CreateUserDTO } from "./dto/create-user-dto";
import { UserDataDTO } from "./dto/user-data-dto";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { db } from "../db";
import { users } from "./schema/user";
import { credential } from "./schema/credential";
import { DatabaseError, DatabaseErrorCode } from "../db/error";
import { NotCreatedError, UserAlreadyExistsError } from "./errors/create";
import { BaseError } from "../errors/base";
import { hash, verify } from "argon2"
import { LoginDTO } from "./dto/login-dto";
import { eq } from "drizzle-orm";

export const routes: FastifyPluginAsyncZod = async (fastify) => {
    fastify.post("/", {
        schema: {
            body: CreateUserDTO,
        }
    }, async (req) => {
        const { username, email, password } = req.body

        try {
            const newUser = await db.transaction(async tx => {
                const userCreationResult = await tx
                    .insert(users)
                    .values({
                        username,
                        email
                    })
                    .returning()
                    .execute()

                const newUser = userCreationResult.at(0)

                if (!newUser) throw new NotCreatedError()

                const passwordHash = await hash(password)

                await tx.insert(credential).values({
                    user_id: newUser.id,
                    password_hash: passwordHash
                })

                return newUser
            })

            return UserDataDTO.parse(newUser)
        } catch (e) {
            const error = new DatabaseError(e)

            if (error.type === DatabaseErrorCode.UNIQUE_VIOLATION) {
                throw new UserAlreadyExistsError()
            }
        }
    })

    fastify.post("/login", {
        schema: {
            body: LoginDTO
        }
    }, async (req) => {
        const { email, password } = req.body

        const possibleUsers = await db
            .select()
            .from(users)
            .leftJoin(credential, eq(users.id, credential.user_id))
            .where(eq(users.email, email))
            .execute()

        const possibleUser = possibleUsers.at(0)

        if (!possibleUser)
            throw new Error("Could not found user with email ${email}")

        const hashedPassword = possibleUser.credentials?.password_hash

        if (!hashedPassword) 
            throw new Error("User does not have a password set")

        const doesHashMatch = await verify(hashedPassword, password)

        if (!doesHashMatch) 
            throw new Error("User's password does not match")

        return UserDataDTO.parse(possibleUser.users)
    })

    fastify.route({
        method: "PUT",
        url: "/",
        handler: async (req) => {
            const data = await req.file()
            const user = getUserFromMultipart(data?.fields)

            if (user?.avatar) {
                await pipeline(user.avatar, createWriteStream("OUTPUT.png"))
            }

            return req.body
        }
    })


    fastify.setErrorHandler(function (error, _request, reply) {
        if (error instanceof BaseError) {
            reply.status(error.statusCode).send(error.getResponse())
        } else {
            reply.send(error)
        }
    })
}

const getUserFromMultipart = (fields: unknown = {}) => {
    const user: Record<string, unknown> = {};
    const updateUserKeys: (keyof UpdateUserDTOType)[] = ["avatar"]

    updateUserKeys.forEach((k) => {
        const f = (fields as Record<string, MultipartFields>)[k]
        const fieldValue = Array.isArray(f) ? f[0] : f

        if (fieldValue) {
            if (fieldValue.type === "field") {
                user[k] = fieldValue.value
            } else {
                user[k] = fieldValue.file
            }
        }
    })

    return UpdateUserDTO.parse(user)
}
