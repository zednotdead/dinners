'use server';

import { api } from '@/lib/api';
import { cookies } from 'next/headers';

export async function logOut() {
  const c = await cookies();

  const res = await api.DELETE('/');
  if (res.data?.success) {
    c.delete('auth');
    return true;
  }

  return false;
}
