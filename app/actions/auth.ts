'use server';

import { cookies } from 'next/headers';
import { AUTH_ACCESS_COOKIE, AUTH_REFRESH_COOKIE } from '@/utils/consts/token.const';

export async function clearHttpOnlyCookiesAction() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_ACCESS_COOKIE);
  cookieStore.delete(AUTH_REFRESH_COOKIE);
}
