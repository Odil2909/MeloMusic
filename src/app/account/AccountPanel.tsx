import Link from "next/link";
import { redirect } from "next/navigation";
import { signOutAction } from "@/app/auth/actions";
import { Icon } from "@/components/ui/Icon";
import { getNeonSession, isNeonAuthConfigured } from "@/lib/neon/auth";

export async function AccountPanel() {
  if (!isNeonAuthConfigured()) {
    return (
      <div className="account-card">
        <span className="auth-eyebrow">НАСТРОЙКА</span>
        <h1>Подключи Neon</h1>
        <p>Запусти <code>neon deploy</code>, чтобы добавить адрес Managed Auth. Секрет cookie должен быть не короче 32 символов.</p>
        <Link className="auth-secondary-link" href="/">Вернуться на главную</Link>
      </div>
    );
  }

  const session = await getNeonSession();
  if (!session?.user) redirect("/auth/login");

  const name = session.user.name?.trim() || null;
  const email = session.user.email || "Почта не указана";
  const displayName = name || "Имя не указано";
  const initials = (name || session.user.email || "M")
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toLocaleUpperCase("ru-RU") ?? "")
    .join("") || "M";

  return (
    <div className="account-card account-profile-card">
      <div className="account-profile-banner">
        <div aria-hidden="true" className="account-banner-glow" />
        <div className="account-profile-topline">
          <Link className="profile-home-link" href="/">
            <Icon name="chevron-right" size={15} />
            Каталог Melo
          </Link>
          <span className="profile-active-chip"><span /> Аккаунт активен</span>
        </div>

        <div className="account-profile-identity">
          <span aria-hidden="true" className="account-avatar-large">{initials}</span>
          <div className="account-identity-copy">
            <span className="account-profile-eyebrow">ТВОЙ ПРОФИЛЬ MELO</span>
            <h1>{name ? `Привет, ${name}` : "Твой профиль"}</h1>
            <p>{email}</p>
          </div>
        </div>
      </div>

      <div className="account-profile-body">
        <div className="account-section-heading">
          <div>
            <span className="account-section-eyebrow">ЛИЧНЫЙ КАБИНЕТ</span>
            <h2>Данные аккаунта</h2>
          </div>
          <span className="account-provider-chip"><Icon name="shield" size={15} /> Neon Managed Auth</span>
        </div>

        <dl className="account-details">
          <div className="account-detail-row">
            <dt><Icon name="mail" size={17} /> Электронная почта</dt>
            <dd>{email}</dd>
          </div>
          <div className="account-detail-row">
            <dt><Icon name="user" size={17} /> Имя профиля</dt>
            <dd>{displayName}</dd>
          </div>
        </dl>

        <div className="account-profile-actions">
          <p><span className="account-profile-status-dot" /> Ты вошёл в Melo</p>
          <div className="account-actions">
            <Link className="profile-catalog-link" href="/">
              Открыть каталог <Icon name="arrow-right" size={16} />
            </Link>
            <form action={signOutAction}>
              <button className="auth-logout" type="submit">Выйти из аккаунта</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
