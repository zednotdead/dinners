import { createClient, Middleware, type paths } from '@dinners/auth-client';
import { cookies } from 'next/headers';

const authMiddleware: Middleware = {
  async onRequest({ request }) {
    const c = await cookies();
    const accessToken = c.get('auth')?.value;

    if (!accessToken) {
      request.headers.delete('Authorization');
    } else {
      request.headers.set('Authorization', `Bearer ${accessToken}`);
    }

    return request;
  },
};

export const api = createClient<paths>({ baseUrl: 'http://localhost:8080' });
api.use(authMiddleware);
