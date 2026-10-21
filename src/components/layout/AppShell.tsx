import type { ReactNode } from "react";
import { Header } from "./Header";
import { MobileNav } from "./MobileNav";
import { PlayerBar } from "./PlayerBar";
import { Sidebar } from "./Sidebar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Перейти к содержимому
      </a>
      <div className="app-shell">
        <Sidebar />
        <div className="app-main-column">
          <Header />
          <main className="main-scroll-area" id="main-content" tabIndex={-1}>
            {children}
          </main>
        </div>
        <MobileNav />
        <PlayerBar />
      </div>
    </>
  );
}
