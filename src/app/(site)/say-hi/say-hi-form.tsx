"use client";

import { useTranslations } from "next-intl";
import { useRef, useState, useTransition } from "react";
import { sendMessage, type MessageResult } from "@/app/actions/messages";
import { Spinner } from "@/components/icons";

const INPUT_CLASS =
  "w-full rounded-[8px] border border-border bg-surface px-[14px] py-[11px] text-[14px] text-ink outline-none placeholder:text-placeholder focus:border-ink";

export function SayHiForm() {
  const t = useTranslations("sayHiPage");
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");
  const [errorKey, setErrorKey] = useState<string>("unavailable");
  const [pending, startTransition] = useTransition();

  const submit = (formData: FormData) => {
    startTransition(async () => {
      const result: MessageResult = await sendMessage(formData);
      if (result.ok) {
        formRef.current?.reset();
        setStatus("sent");
      } else {
        setErrorKey(result.error);
        setStatus("error");
      }
    });
  };

  return (
    <form
      ref={formRef}
      action={submit}
      className="flex flex-col gap-[14px] text-left"
    >
      {/* honeypot — hidden from real users, catches naive bots */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
      />
      <div>
        <label htmlFor="say-hi-name" className="mb-[6px] block text-[13px] font-semibold">
          {t("name")}
        </label>
        <input
          id="say-hi-name"
          type="text"
          name="name"
          required
          maxLength={80}
          placeholder={t("namePlaceholder")}
          className={INPUT_CLASS}
        />
      </div>
      <div>
        <label htmlFor="say-hi-email" className="mb-[6px] block text-[13px] font-semibold">
          {t("email")}
        </label>
        <input
          id="say-hi-email"
          type="email"
          name="email"
          required
          maxLength={200}
          placeholder={t("emailPlaceholder")}
          className={INPUT_CLASS}
        />
      </div>
      <div>
        <label htmlFor="say-hi-body" className="mb-[6px] block text-[13px] font-semibold">
          {t("message")}
        </label>
        <textarea
          id="say-hi-body"
          name="body"
          required
          maxLength={4000}
          placeholder={t("messagePlaceholder")}
          className={`${INPUT_CLASS} h-24 resize-none`}
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="mt-[6px] inline-flex items-center justify-center gap-2 rounded-[8px] bg-ink p-3 text-[14px] font-semibold text-bg disabled:opacity-60"
      >
        {pending && <Spinner size={14} />}
        {pending ? t("sending") : t("send")}
      </button>
      {status === "sent" && (
        <p className="text-center text-[13px] text-muted">{t("success")}</p>
      )}
      {status === "error" && (
        <p className="text-center text-[13px] text-muted">
          {t(`error.${errorKey}`)}
        </p>
      )}
    </form>
  );
}
