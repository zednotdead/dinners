'use server';

import { cookies } from 'next/headers';
import { getUser as getUserAPI } from '../api/get';

export async function getUser() {
  const c = await cookies();

  const loginCookie = c.get('auth');

  if (loginCookie) {
    return await getUserAPI(loginCookie.value);
  }
  return undefined;
}
