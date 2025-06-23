import fastify from 'fastify'
import { fastifyOtelInstrumentation } from './instrumentation'
import { log } from './log';

const app = fastify();
await app.register(fastifyOtelInstrumentation.plugin());

app.addHook('onRequest', (req, reply, done) => {
    const { inject } = req.opentelemetry()

    const propagatedTextmap = {}
    inject(propagatedTextmap)

    reply.headers(propagatedTextmap)

    done()
})

app.get("/", () => {
    log.info("ping!")
    return {
        foo: "bar"
    }
})

app.listen({ port: 8080 }, (err, address) => {
    if (err) {
        console.error(err)
        process.exit(1)
    }
    log.info(`Server listening at ${address}`, { address })
})
