import fp from "fastify-plugin"
import fastifyJwt from '@fastify/jwt'
import type { FastifyReply, FastifyRequest, onRequestHookHandler } from "fastify"
import { valkey } from "../../cache"
import { BaseError } from "../../errors/base"

export default fp(async function (fastify) {
    await fastify.register(fastifyJwt, {
        secret: {
            public: process.env.AUTH_JWT_PUBLIC_KEY!,
            private: process.env.AUTH_JWT_PRIVATE_KEY!,
        },
    })

    fastify.decorateRequest("jwt", null)
    fastify.addHook('preParsing', function setJwt(req, _reply, _payload, done) {
        try {
            req.jwt = fastify.jwt.lookupToken(req)
        } catch {
            req.jwt = null
        }
        done()
    })

    fastify.decorate("authenticate", async function authenticate(req: FastifyRequest, res: FastifyReply) {
        try {
            req.log.debug({ msg: "Checking if JWT was provided in Authorization", req })

            const jwt = fastify.jwt.lookupToken(req)

            if (!jwt) {
                req.log.debug({ msg: "JWT was not provided, access denied", req })
                throw new BaseError(403, "Not logged in")
            }

            req.log.debug({ msg: "Checking if JWT is on the list of banned JWTs", req })
            const isJWTBanned = await valkey.sismember('banned-jwt', jwt)

            if (isJWTBanned) {
                throw new BaseError(403, "Not logged in")
            }

            await req.jwtVerify()
        } catch (err) {
            res.send(err)
        }
    })
})

declare module 'fastify' {
    export interface FastifyInstance {
        authenticate: onRequestHookHandler
    }

    export interface FastifyRequest {
        jwt: string | null
    }
}
