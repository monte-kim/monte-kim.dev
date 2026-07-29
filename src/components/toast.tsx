"use client";

import { useEffect, useState } from "react";
import { CheckIcon, CloseIcon } from "@/components/icons";

type Toast = { id: number; message: string; variant: "success" | "error" };

/** Fire a toast from anywhere (client-side). Mount <Toaster/> once per layout. */
export function showToast(message: string, variant: Toast["variant"] = "success") {
  window.dispatchEvent(
    new CustomEvent("app-toast", { detail: { message, variant } })
  );
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    let nextId = 1;
    const onToast = (e: Event) => {
      const { message, variant } = (e as CustomEvent).detail;
      const id = nextId++;
      setToasts((prev) => [...prev, { id, message, variant }]);
      setTimeout(
        () => setToasts((prev) => prev.filter((t) => t.id !== id)),
        3200
      );
    };
    window.addEventListener("app-toast", onToast);
    return () => window.removeEventListener("app-toast", onToast);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-16 left-1/2 z-[60] flex -translate-x-1/2 flex-col items-center gap-2 md:bottom-6 md:left-auto md:right-6 md:translate-x-0 md:items-end">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="animate-toast-in flex items-center gap-2 rounded-[8px] bg-ink px-4 py-[10px] text-[13px] font-medium text-bg shadow-menu"
        >
          {toast.variant === "success" ? (
            <CheckIcon size={13} />
          ) : (
            <CloseIcon size={13} />
          )}
          {toast.message}
        </div>
      ))}
    </div>
  );
}
