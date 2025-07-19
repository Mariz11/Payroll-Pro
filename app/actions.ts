'use server';

import exp from 'constants';
import { cookies } from 'next/headers';

export async function deleteCookie(name: string) {
  cookies().delete(name);
  cookies().delete('selected-company');
}

export async function encrypt(data: string) {
  return btoa(data);
}

export async function decrypt(data: string) {
  return atob(data);
}
