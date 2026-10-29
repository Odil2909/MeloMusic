"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signInAction, signUpAction } from "@/app/auth/actions";
import { EMPTY_AUTH_ACTION_STATE, type AuthActionState } from "@/features/auth/types";

type AuthFormProps = { mode: "login" | "register" };
type AuthAction = (state: AuthActionState, formData: FormData) => Promise<AuthActionState>;

export function AuthForm({ mode }: AuthFormProps) {
  const isRegister = mode === "register";
  const action: AuthAction = isRegister ? signUpAction : signInAction;
  const [state, formAction, pending] = useActionState(action, EMPTY_AUTH_ACTION_STATE);

  return (
    <form action={formAction} className="auth-form">
      {isRegister && (
        <label className="auth-field">
          <span>Имя</span>
          <input autoComplete="name" maxLength={80} minLength={2} name="displayName" placeholder="Как к тебе обращаться?" required />
        </label>
      )}
      <label className="auth-field">
        <span>Электронная почта</span>
        <input autoComplete="email" maxLength={254} name="email" placeholder="name@example.com" required type="email" />
      </label>
      <label className="auth-field">
        <span>Пароль</span>
        <input
          autoComplete={isRegister ? "new-password" : "current-password"}
          maxLength={128}
          minLength={isRegister ? 8 : undefined}
          name="password"
          placeholder={isRegister ? "Не менее 8 символов" : "Твой пароль"}
          required
          type="password"
        />
      </label>

      {state.error && <p className="auth-feedback auth-feedback-error" role="alert">{state.error}</p>}
      {state.success && <p className="auth-feedback auth-feedback-success" role="status">{state.success}</p>}

      <button className="auth-submit" disabled={pending} type="submit">
        <span>{pending ? "Подождите…" : isRegister ? "Создать аккаунт" : "Войти в аккаунт"}</span>
        {!pending && <span aria-hidden="true" className="auth-submit-arrow">→</span>}
      </button>
      <p className="auth-switch">
        {isRegister ? "Уже есть аккаунт? " : "Впервые в Melo? "}
        <Link href={isRegister ? "/auth/login" : "/auth/register"}>
          {isRegister ? "Войти" : "Зарегистрироваться"}
        </Link>
      </p>
    </form>
  );
}
