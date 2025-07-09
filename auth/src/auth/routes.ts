import type { Multipart, MultipartFields } from '@fastify/multipart';
import { UpdateUserDTO } from './dto/update-user-dto';
import { CreateUserDTO } from './dto/create-user-dto';
import { UserDataDTO, type UserDataDTOType } from './dto/user-data-dto';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { db } from '../db';
import { users } from './schema/user';
import { credential } from './schema/credential';
import { DatabaseError, DatabaseErrorCode } from '../db/error';
import { NotCreatedError, UserAlreadyExistsError } from './errors/create';
import { BaseError, BaseErrorDTO } from '../errors/base';
import { hash, verify } from 'argon2';
import { LoginDTO } from './dto/login-dto';
import { eq } from 'drizzle-orm';
import { JWTPayloadDTO } from './dto/jwt-payload-dto';
import { valkey } from '../cache';
import { BaseMessageDTO } from './dto/base-message-dto';
import { InvalidPasswordError, UserHasNoPasswordError, UserNotFoundError } from './errors/login';
import { LoginResponseDTO } from './dto/login-response-dto';
import { s3 } from '../s3';
import { type MultipartFileType } from './dto/multipart-file';

export const routes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.post('/', {
    schema: {
      body: CreateUserDTO,
      response: {
        200: UserDataDTO,
        500: BaseErrorDTO,
        409: BaseErrorDTO,
      },
    },
  }, async function register(req) {
    const { username, email, password } = req.body;

    try {
      const newUser = await db.transaction(async (tx) => {
        const userCreationResult = await tx
          .insert(users)
          .values({
            username,
            email,
          })
          .returning()
          .execute();

        const newUser = userCreationResult.at(0);

        if (!newUser) throw new NotCreatedError();

        const passwordHash = await hash(password);

        await tx.insert(credential).values({
          user_id: newUser.id,
          password_hash: passwordHash,
        });

        return newUser;
      });

      return UserDataDTO.parse(newUser);
    } catch (e) {
      const error = new DatabaseError(e);

      if (error.type === DatabaseErrorCode.UNIQUE_VIOLATION) {
        throw new UserAlreadyExistsError();
      } else {
        throw error;
      }
    }
  });

  fastify.post('/login', {
    schema: {
      body: LoginDTO,
      response: {
        200: LoginResponseDTO,
        401: BaseErrorDTO,
        403: BaseErrorDTO,
      },
    },
  }, async function login(req, res) {
    const { email, password } = req.body;

    const possibleUsers = await db
      .select()
      .from(users)
      .leftJoin(credential, eq(users.id, credential.user_id))
      .where(eq(users.email, email))
      .execute();

    const possibleUser = possibleUsers.at(0);

    if (!possibleUser)
      throw new UserNotFoundError(req.body);

    const hashedPassword = possibleUser.credentials?.password_hash;

    if (!hashedPassword)
      throw new UserHasNoPasswordError(req.body);

    const doesHashMatch = await verify(hashedPassword, password);

    if (!doesHashMatch)
      throw new InvalidPasswordError();

    const user = UserDataDTO.parse(possibleUser.users);
    const payload = JWTPayloadDTO.parse(user);

    const jwt = await res.jwtSign(payload, { sign: { expiresIn: '2 days' } });

    return {
      access_token: jwt,
    };
  });

  fastify.get('/', { onRequest: [fastify.authenticate] }, async function userinfo(req) {
    const payload = req.user;
    const userPossible = await db.select().from(users).where(eq(users.id, payload.id)).execute();
    const user = UserDataDTO.parse(userPossible[0]);

    return user;
  });

  fastify.get<{ Params: { userId: string } }>(
    '/:userId',
    { onRequest: [fastify.authenticate] },
    async function getUser(req) {
      const { userId } = req.params;
      const userPossible = await db.select().from(users).where(eq(users.id, userId)).execute();
      const user = UserDataDTO.parse(userPossible[0]);

      return user;
    },
  );

  fastify.get('/list', { onRequest: [fastify.authenticate] }, async () => {
    const userPossible = await db.select().from(users).execute();
    return userPossible
      .map((u) => UserDataDTO.safeParse(u))
      .filter((u) => u.success === true)
      .map((u) => u.data);
  });

  fastify.post(
    '/logout',
    {
      onRequest: [fastify.authenticate],
      schema: {
        response: {
          200: BaseMessageDTO,
          401: BaseErrorDTO,
          403: BaseErrorDTO,
        },
      },
    },
    async function logout(req) {
      if (!req.jwt) {
        throw new BaseError(401, 'Missing JWT, somehow');
      }
      await valkey.sadd('banned-jwt', [req.jwt]);

      return { message: 'logged out' };
    });

  fastify.route({
    method: 'PUT',
    url: '/',
    onRequest: [fastify.authenticate],
    handler: async (req, res) => {
      const userUpdate = getUserFromMultipart(req.body);
      const userPossible = await db.select().from(users).where(eq(users.id, req.user.id)).execute();
      const user = userPossible[0];
      const updateObj: Partial<UserDataDTOType> = { ...userUpdate, avatar: undefined };

      if (!user) {
        throw new Error('No user to update');
      }

      if (userUpdate?.avatar === '') {
        req.log.debug('Clearing user\'s avatar');
        try {
          req.log.debug(`Deleting file avatar/${user.id}`);
          await s3.delete(`avatar/${user.id}`);
        } catch {
          req.log.error(`Could not delete file avatar/${user.id}, delete it manually`, user);
        }
        updateObj.avatar = null;
      } else if (userUpdate.avatar) {
        req.log.debug('Writing a new avatar to S3');
        const userAvatar = s3.file(`avatar/${user.id}`, { type: userUpdate.avatar.metadata.mimetype });
        const writer = userAvatar.writer({
          retry: 3,
          queueSize: 10,
          partSize: 5 * 1024 * 1024,
        });

        for await (const chunk of userUpdate.avatar.file) {
          writer.write(chunk);
        }

        await writer.end();
        updateObj.avatar = userAvatar.name;
      }

      if (Object.keys(updateObj).length > 0) {
        const updatedUser = await db
          .update(users)
          .set(updateObj)
          .where(eq(users.id, user.id))
          .returning()
          .execute();

        res.status(200).send(UserDataDTO.parse(updatedUser[0]));
      }

      res.status(304);
    },
  });
};

const getUserFromMultipart = (fields: unknown = {}) => {
  const user: Record<string, string | MultipartFileType> = {};
  const updateUserKeys = Object.keys(fields as MultipartFields);

  updateUserKeys.forEach((k) => {
    const f = (fields as Record<string, MultipartFields>)[k];
    const fieldValue: Multipart = Array.isArray(f) ? f[0] : f;

    if (fieldValue) {
      if (fieldValue.type === 'field') {
        user[k] = fieldValue.value as string;
      } else {
        user[k] = {
          file: fieldValue.file,
          metadata: {
            filename: fieldValue.filename,
            mimetype: fieldValue.mimetype,
          },
        };
      }
    }
  });

  return UpdateUserDTO.parse(user);
};
