'use server';

import { cookies } from 'next/headers';

export async function logOut() {
  const c = await cookies();

  const loginCookie = c.get('auth');

  if (loginCookie) {
    c.delete('auth');
    return true;
  }

  return false;
}
