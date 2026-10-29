import Link from "next/link";
import { signOutAction } from "@/app/auth/actions";
import { Icon } from "@/components/ui/Icon";
import { getNeonSession, isNeonAuthConfigured } from "@/lib/neon/auth";

export async function AccountStatus() {
  if (!isNeonAuthConfigured()) {
    return (
      <div className="account-status">
        <Link className="account-login-link" href="/auth/login">Войти</Link>
        <Link className="account-register-link" href="/auth/register">Регистрация</Link>
      </div>
    );
  }

  const session = await getNeonSession();
  const user = session?.user;
  if (!user) {
    return (
      <div className="account-status">
        <Link className="account-login-link" href="/auth/login">Войти</Link>
        <Link className="account-register-link" href="/auth/register">Регистрация</Link>
      </div>
    );
  }

  const label = user.name?.trim() || user.email || "Профиль";

  return (
    <div className="account-status">
      <Link aria-label={`Профиль: ${label}`} className="profile-button" href="/account">
        <span className="profile-avatar"><Icon name="user" size={17} /></span>
        <span className="account-status-label">{label}</span>
      </Link>
      <form action={signOutAction}>
        <button className="account-signout-button" type="submit">Выйти</button>
      </form>
    </div>
  );
}
