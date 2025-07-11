'use server';

import { cookies } from 'next/headers';
import { logIn as logInAPI } from '../api/login';
import { getUser } from './get';

export async function logIn() {
  const accessToken = await logInAPI();

  const c = await cookies();
  c.set('auth', accessToken, { secure: true, httpOnly: true });

  const user = await getUser();

  return user;
}
