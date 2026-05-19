"use client";

import { ConsoleSessionProvider } from "@/features/session/ConsoleSessionProvider";
import { LoginForm } from "@/components/auth/LoginForm";

export default function SignInPage() {
  return (
    <ConsoleSessionProvider>
      <LoginForm />
    </ConsoleSessionProvider>
  );
}
