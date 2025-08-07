'use server';

import { api } from '@/lib/api';

export async function getUser() {
  const user = await api.GET('/');
  if (user.data) {
    return user.data;
  }
  return undefined;
}
