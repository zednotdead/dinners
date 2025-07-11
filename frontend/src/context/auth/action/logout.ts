'use server';

import { cookies } from 'next/headers';
import { logOut as logOutAPI } from '../api/logout';

export async function logOut() {
  const c = await cookies();

  const loginCookie = c.get('auth');

  if (loginCookie) {
    return await logOutAPI(loginCookie.value);
  }

  return false;
}
