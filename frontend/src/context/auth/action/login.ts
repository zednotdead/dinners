'use server';

import { cookies } from 'next/headers';
import { logIn as logInAPI } from '@/lib/api/login';
import { getUser } from './get';
import { BasePasswordError } from '@/lib/api/login/errors';

export async function logIn(email: string, password: string) {
  try {
    const accessToken = await logInAPI(email, password);
    const c = await cookies();
    c.set('auth', accessToken, { secure: true, httpOnly: true });

    const user = await getUser();

    return {
      user,
      code: 200,
    };
  } catch (e) {
    if (e instanceof BasePasswordError) {
      console.log(e);
      return {
        error: e.message,
        code: e.code,
      };
    }

    return {
      error: 'Something went wrong. Try again later.',
      code: 500,
    };
  }
}
