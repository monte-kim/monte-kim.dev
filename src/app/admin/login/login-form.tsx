"use client";

import { useState, useTransition } from "react";
import { signIn } from "@/app/actions/auth";

const INPUT_CLASS =
  "w-full rounded-[8px] border border-border bg-surface px-[14px] py-[11px] text-[14px] text-ink outline-none placeholder:text-placeholder focus:border-ink";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const result = await signIn(formData);
      // on success signIn redirects and never returns
      if (result?.error === "invalid") setError("Wrong email or password.");
      else if (result?.error === "unavailable")
        setError("Supabase is not connected — admin login is unavailable.");
    });
  };

  return (
    <form action={submit} className="flex flex-col gap-[14px] text-left">
      <div>
        <label htmlFor="admin-email" className="mb-[6px] block text-[13px] font-semibold">
          Email
        </label>
        <input
          id="admin-email"
          type="email"
          name="email"
          required
          autoComplete="email"
          className={INPUT_CLASS}
        />
      </div>
      <div>
        <label htmlFor="admin-password" className="mb-[6px] block text-[13px] font-semibold">
          Password
        </label>
        <input
          id="admin-password"
          type="password"
          name="password"
          required
          autoComplete="current-password"
          className={INPUT_CLASS}
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="mt-[6px] rounded-[8px] bg-ink p-3 text-[14px] font-semibold text-bg disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
      {error && <p className="text-center text-[13px] text-muted">{error}</p>}
    </form>
  );
}
