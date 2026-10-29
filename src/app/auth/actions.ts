"use server";

import { redirect } from "next/navigation";
import type { AuthActionState } from "@/features/auth/types";
import { getNeonAuth, isNeonAuthConfigured } from "@/lib/neon/auth";

const INVALID_SIGN_IN: AuthActionState = {
  error: "Не удалось войти. Проверьте адрес почты и пароль.",
  success: null,
};

const NEON_AUTH_UNAVAILABLE: AuthActionState = {
  error: "Neon Auth пока не настроен. Запустите neon deploy и проверьте .env.local.",
  success: null,
};

export async function signInAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = readString(formData, "email").trim().toLowerCase();
  const password = readString(formData, "password");

  if (!isValidEmail(email) || !password) {
    return { ...INVALID_SIGN_IN };
  }

  if (!isNeonAuthConfigured()) return { ...NEON_AUTH_UNAVAILABLE };

  try {
    const { error } = await getNeonAuth().signIn.email({ email, password });
    if (error) return { ...INVALID_SIGN_IN };
  } catch {
    return { error: "Сервис входа временно недоступен. Проверьте подключение Neon и попробуйте ещё раз.", success: null };
  }

  redirect("/account");
}

export async function signUpAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const displayName = readString(formData, "displayName").trim();
  const email = readString(formData, "email").trim().toLowerCase();
  const password = readString(formData, "password");

  if (displayName.length < 2 || displayName.length > 80) {
    return { error: "Имя должно содержать от 2 до 80 символов.", success: null };
  }
  if (!isValidEmail(email)) {
    return { error: "Введите корректный адрес электронной почты.", success: null };
  }
  if (password.length < 8 || password.length > 128) {
    return { error: "Пароль должен содержать от 8 до 128 символов.", success: null };
  }

  if (!isNeonAuthConfigured()) return { ...NEON_AUTH_UNAVAILABLE };

  try {
    const { error } = await getNeonAuth().signUp.email({
      email,
      name: displayName,
      password,
    });
    if (error) {
      return { error: "Не удалось создать аккаунт. Проверьте данные и попробуйте позже.", success: null };
    }
  } catch {
    return { error: "Сервис регистрации временно недоступен. Проверьте подключение Neon и попробуйте ещё раз.", success: null };
  }

  redirect("/account");
}

export async function signOutAction(): Promise<void> {
  try {
    if (isNeonAuthConfigured()) await getNeonAuth().signOut();
  } finally {
    redirect("/auth/login");
  }
}

function readString(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function isValidEmail(value: string): boolean {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

