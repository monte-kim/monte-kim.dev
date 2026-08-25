import { LogoMark } from "@/components/logo";
import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Admin — monte-kim.dev",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-[360px] flex-col justify-center px-6 py-16">
      <div className="mb-8 flex items-center gap-[9px]">
        <LogoMark size={26} className="text-ink" />
        <span className="text-[15px] font-semibold">monte-kim.dev</span>
        <span className="rounded-full border border-hairline bg-subtle px-2 py-[2px] font-mono text-[11px] text-muted">
          admin
        </span>
      </div>
      <LoginForm />
    </div>
  );
}
