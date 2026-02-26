'use server';
import { cookies } from 'next/headers';

export async function setUniqueCookie(uniqueCode: string) {
  cookies().set({
    name: 'uniqueCode',
    value: uniqueCode,
    httpOnly: true,
    path: '/',
    // Optional: set expiration
    maxAge: 60 * 60 * 24 // 24 hours
  });
}
