import Image from "next/image";
import Link from "next/link";
import { AuthForm } from "@/features/auth/AuthForm";
import { Icon } from "@/components/ui/Icon";
import brandMark from "../../../logo/M_logo.png";

type AuthPageLayoutProps = {
  mode: "login" | "register";
};

export function AuthPageLayout({ mode }: AuthPageLayoutProps) {
  const isRegister = mode === "register";

  return (
    <section aria-labelledby="auth-title" className={`auth-page auth-page-${mode}`}>
      <div className="auth-layout">
        <aside aria-label="О Melo" className="auth-showcase">
          <Link aria-label="Melo — на главную" className="auth-showcase-brand" href="/">
            <span className="auth-showcase-logo">
              <Image alt="" className="auth-showcase-logo-image" height={29} priority src={brandMark} width={36} />
            </span>
            <span className="auth-showcase-wordmark">Melo<small>МУЗЫКА БЛИЖЕ</small></span>
          </Link>

          <div aria-hidden="true" className="auth-showcase-art">
            <span className="auth-art-orbit auth-art-orbit-one" />
            <span className="auth-art-orbit auth-art-orbit-two" />
            <span className="auth-vinyl-disc"><span className="auth-vinyl-label">M</span></span>
            <span className="auth-art-caption"><Icon name="sparkles" size={14} /> JAMENDO CATALOG</span>
          </div>

          <div className="auth-showcase-copy">
            <span className="auth-showcase-kicker"><span /> НЕЗАВИСИМАЯ МУЗЫКА</span>
            <h2>Меньше шума.<br />Больше музыки.</h2>
            <p>Открывай новые имена и звучание независимых артистов из каталога Jamendo.</p>
          </div>

          <div className="auth-showcase-footer">
            <span className="auth-footer-dot" />
            Каталог Melo · данные Jamendo
          </div>
        </aside>

        <div className="auth-card">
          <div className="auth-card-topline">
            <Link className="auth-back-link" href="/">
              <Icon className="auth-back-icon" name="chevron-right" size={15} />
              На главную
            </Link>
            <span className="auth-card-index">{isRegister ? "НОВЫЙ АККАУНТ" : "БЕЗОПАСНЫЙ ВХОД"}</span>
          </div>

          <div className="auth-card-content">
            <div className="auth-card-heading">
              <span className="auth-eyebrow">{isRegister ? "ТВОЙ ПРОФИЛЬ MELO" : "СНОВА РЯДОМ"}</span>
              <h1 id="auth-title">{isRegister ? "Создай свой профиль" : "С возвращением"}</h1>
              <p className="auth-description">
                {isRegister
                  ? "Один небольшой шаг — и ты снова в мире новой музыки."
                  : "Войди в аккаунт и продолжай открывать музыку."}
              </p>
            </div>

            <AuthForm mode={mode} />

            <p className="auth-provider-note">
              <Icon name="shield" size={15} />
              Вход подключён через Neon Managed Auth
            </p>
          </div>

          <div className="auth-card-footer">MELO <span>·</span> MUSIC CATALOG</div>
        </div>
      </div>
    </section>
  );
}
