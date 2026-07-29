"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { AdminActionResult } from "@/app/actions/admin";

/** Confirm-then-delete button for admin lists (bound server action). */
export function DeleteButton({
  action,
  confirmText,
  disabled,
}: {
  action: () => Promise<AdminActionResult>;
  confirmText: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [failed, setFailed] = useState(false);
  const [pending, startTransition] = useTransition();

  const onClick = () => {
    if (!window.confirm(confirmText)) return;
    setFailed(false);
    startTransition(async () => {
      const result = await action();
      if (result.ok) router.refresh();
      else setFailed(true);
    });
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || pending}
      className="rounded-[6px] border border-btn2-border px-[10px] py-[4px] text-[12px] font-semibold text-muted hover:border-border hover:text-ink disabled:opacity-50"
    >
      {pending ? "Deleting…" : failed ? "Failed — retry" : "Delete"}
    </button>
  );
}
