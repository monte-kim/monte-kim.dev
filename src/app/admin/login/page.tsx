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
        <span className="flex h-[26px] w-[26px] items-center justify-center rounded-[7px] border-[1.5px] border-ink text-[12px] font-bold tracking-[-0.5px]">
          TK
        </span>
        <span className="text-[15px] font-semibold">monte-kim.dev</span>
        <span className="rounded-full border border-hairline bg-subtle px-2 py-[2px] font-mono text-[11px] text-muted">
          admin
        </span>
      </div>
      <LoginForm />
    </div>
  );
}
