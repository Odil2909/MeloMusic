import type { Metadata } from "next";
import { AuthPageLayout } from "@/features/auth/AuthPageLayout";

export const metadata: Metadata = { title: "Регистрация" };

export default function RegisterPage() {
  return <AuthPageLayout mode="register" />;
}
