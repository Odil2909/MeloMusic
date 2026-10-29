import type { Metadata } from "next";
import { Suspense } from "react";
import { AccountPanel } from "@/app/account/AccountPanel";

export const metadata: Metadata = { title: "Аккаунт" };

export default function AccountPage() {
  return (
    <section className="auth-page auth-page-account">
      <Suspense fallback={<div className="account-card account-loading-card"><p>Загружаем профиль…</p></div>}>
        <AccountPanel />
      </Suspense>
    </section>
  );
}
