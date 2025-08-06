import fastify from 'fastify';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import { routes } from './auth/routes';
import fastifyMultipart, { type MultipartValue } from '@fastify/multipart';
import { fastifyOtelInstrumentation, sdk } from './instrumentation';
import gracefulShutdown from 'http-graceful-shutdown';
import { pool } from './db';
import authenticatePlugin from './auth/middleware/authenticate';
import { BaseError } from './errors/base';
import { s3 } from './s3';
import { uuidv4 } from 'zod/v4';

sdk.start();

export const app = fastify({
  logger: {
    level: 'trace',
    redact: ['req.headers.authorization'],
    transport: {
      targets: [
        {
          target: process.env.NODE_ENV === 'development' ? 'pino-pretty' : 'pino/file',
          options: { destination: 1 },
        },
      ],
    },
    serializers: {
      req(request) {
        return {
          method: request.method,
          url: request.url,
          headers: request.headers,
          host: request.host,
          remoteAddress: request.ip,
          remotePort: request.socket.remotePort,
        };
      },
    },
  },
});

await app.register(fastifyOtelInstrumentation.plugin());

await app.register(fastifyMultipart, {
  attachFieldsToBody: 'keyValues',
  async onFile(part) {
    this.log.info('Uploading temporary file', { filename: part.filename });
    const tempFile = s3.file(`temp/${uuidv4()}-${part.filename}`, { type: part.mimetype });
    const writer = tempFile.writer({
      retry: 3,
      queueSize: 10,
      partSize: 5 * 1024 * 1024,
    });

    for await (const chunk of part.file) {
      writer.write(chunk);
    }

    await writer.end();

    if (!tempFile.name) {
      throw new Error('Could not upload file');
    }

    (part as unknown as MultipartValue).value = tempFile.name;
  },
});

await app.register(authenticatePlugin);

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.addHook('onRequest', (req, reply, done) => {
  const { inject } = req.opentelemetry();

  const propagatedTextmap = {};
  inject(propagatedTextmap);

  reply.headers(propagatedTextmap);

  done();
});

app.setErrorHandler(function (error, _request, reply) {
  if (error instanceof BaseError) {
    reply.status(error.statusCode).send(error.getResponse());
  } else {
    reply.send(error);
  }
});

await app.register(routes);

app.listen({ port: process.env.AUTH_PORT ? parseInt(process.env.AUTH_PORT) : 8080 }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
});

gracefulShutdown(app.server,
  {
    onShutdown: async function () {
      app.log.info('Shutting down...');
      await pool.end();
    },
    finally: function () {
      app.log.info('Server graceful shut down completed.');
    },
  },
);
