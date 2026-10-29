import type { Metadata } from "next";
import { AuthPageLayout } from "@/features/auth/AuthPageLayout";

export const metadata: Metadata = { title: "Вход" };

export default function LoginPage() {
  return <AuthPageLayout mode="login" />;
}
