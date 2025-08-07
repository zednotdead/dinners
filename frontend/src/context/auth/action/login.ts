'use server';

import { api } from '@/lib/api';
import { cookies } from 'next/headers';

export async function logIn(username: string, password: string) {
  try {
    const res = await api.POST('/login', { body: { username, password } });
    const c = await cookies();

    if (res.error) throw res.error;

    c.set('auth', res.data.token, { secure: true, httpOnly: true });

    const userRes = await api.GET('/');
    if (userRes.error && !userRes.error.success) {
      throw new Error(userRes.error.message);
    }
    const user = userRes.data;

    return {
      user,
      code: 200,
    };
  } catch (e) {
    if (e instanceof Error) {
      return {
        error: e.message,
        code: 400,
      };
    }

    return {
      error: 'Something went wrong. Try again later.',
      code: 500,
    };
  }
}
