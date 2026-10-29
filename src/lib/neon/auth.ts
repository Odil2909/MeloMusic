import "server-only";

import { createNeonAuth } from "@neondatabase/auth/next/server";
import { connection } from "next/server";

type NeonAuthInstance = ReturnType<typeof createNeonAuth>;

let authInstance: NeonAuthInstance | undefined;

export function isNeonAuthConfigured(): boolean {
  const baseUrl = process.env.NEON_AUTH_BASE_URL?.trim();
  const cookieSecret = process.env.NEON_AUTH_COOKIE_SECRET?.trim();
  return Boolean(baseUrl && cookieSecret && cookieSecret.length >= 32);
}

export function getNeonAuth(): NeonAuthInstance {
  const baseUrl = process.env.NEON_AUTH_BASE_URL?.trim();
  const cookieSecret = process.env.NEON_AUTH_COOKIE_SECRET?.trim();

  if (!baseUrl || !cookieSecret || cookieSecret.length < 32) {
    throw new Error("Neon Auth is not configured. Set NEON_AUTH_BASE_URL and NEON_AUTH_COOKIE_SECRET.");
  }

  authInstance ??= createNeonAuth({
    baseUrl,
    cookies: { secret: cookieSecret },
  });

  return authInstance;
}

export async function getNeonSession() {
  if (!isNeonAuthConfigured()) return null;

  try {
    await connection();
    const { data, error } = await getNeonAuth().getSession();
    return error ? null : data ?? null;
  } catch {
    return null;
  }
}
