import fastify from 'fastify'
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import { routes } from './auth/routes';
import fastifyMultipart from '@fastify/multipart'
import fastifyJwt from '@fastify/jwt'
import { fastifyOtelInstrumentation, sdk } from './instrumentation'
import gracefulShutdown from 'http-graceful-shutdown'
import { pool } from './db';

sdk.start()

export const app = fastify({ logger: true });
await app.register(fastifyOtelInstrumentation.plugin());
await app.register(fastifyMultipart)
await app.register(fastifyJwt, {
    secret: {
        public: process.env.AUTH_JWT_PUBLIC_KEY!,
        private: process.env.AUTH_JWT_PRIVATE_KEY!,
    },
})

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.addHook('onRequest', (req, reply, done) => {
    const { inject } = req.opentelemetry()

    const propagatedTextmap = {}
    inject(propagatedTextmap)

    reply.headers(propagatedTextmap)

    done()
})

await app.register(routes)

app.listen({ port: process.env.AUTH_PORT ? parseInt(process.env.AUTH_PORT) : 8080 }, (err) => {
    if (err) {
        app.log.error(err)
        process.exit(1)
    }
})

gracefulShutdown(app.server,
    {
        onShutdown: async function () {
            app.log.info("Shutting down...")
            await pool.end()
        },
        finally: function () {
            app.log.info('Server graceful shut down completed.');
        }
    }
);
