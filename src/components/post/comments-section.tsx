"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useRef, useState, useTransition } from "react";
import { addComment, type CommentResult } from "@/app/actions/comments";
import { CommentIcon } from "@/components/icons";
import type { CommentItem } from "@/lib/posts";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

function timeAgo(iso: string, locale: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const rtf = new Intl.RelativeTimeFormat(locale === "ko" ? "ko" : "en", {
    numeric: "auto",
  });
  const minutes = Math.round(diffMs / 60_000);
  if (minutes < 60) return rtf.format(-Math.max(minutes, 0), "minute");
  const hours = Math.round(minutes / 60);
  if (hours < 24) return rtf.format(-hours, "hour");
  const days = Math.round(hours / 24);
  if (days < 30) return rtf.format(-days, "day");
  const months = Math.round(days / 30);
  if (months < 12) return rtf.format(-months, "month");
  return rtf.format(-Math.round(months / 12), "year");
}

function CommentForm({
  slug,
  parentId,
  onDone,
}: {
  slug: string;
  parentId: string | null;
  onDone?: () => void;
}) {
  const t = useTranslations("post");
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const result: CommentResult = await addComment(slug, parentId, formData);
      if (result.ok) {
        formRef.current?.reset();
        onDone?.();
        router.refresh();
      } else {
        setError(t(`error.${result.error}`));
      }
    });
  };

  return (
    <form
      ref={formRef}
      action={submit}
      className="rounded-[9px] border border-border bg-surface px-[14px] py-3 md:rounded-[10px] md:px-4 md:py-[14px]"
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
      <textarea
        name="body"
        required
        rows={2}
        maxLength={4000}
        placeholder={t("addComment")}
        className="w-full resize-none bg-transparent text-[13.5px] text-ink outline-none placeholder:text-placeholder md:text-[14px]"
      />
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 md:mt-4">
        <div className="flex min-w-0 gap-3">
          <input
            type="text"
            name="name"
            required
            maxLength={80}
            placeholder={t("name")}
            className="w-[90px] bg-transparent text-[12px] text-ink outline-none placeholder:text-placeholder"
          />
          <input
            type="email"
            name="email"
            maxLength={200}
            placeholder={t("emailOptional")}
            className="w-[130px] bg-transparent text-[12px] text-ink outline-none placeholder:text-placeholder"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-[6px] bg-ink px-[14px] py-[6px] text-[12.5px] font-semibold text-bg disabled:opacity-60"
        >
          {t("post")}
        </button>
      </div>
      {error && <p className="mt-2 text-[12px] text-muted">{error}</p>}
    </form>
  );
}

function CommentRow({
  comment,
  slug,
  locale,
  isReply,
  canReply,
}: {
  comment: CommentItem;
  slug: string;
  locale: string;
  isReply: boolean;
  canReply: boolean;
}) {
  const t = useTranslations("post");
  const [replying, setReplying] = useState(false);

  return (
    <div className={`flex gap-3 ${isReply ? "pl-11" : ""}`}>
      <span
        className={`flex h-8 w-8 flex-none items-center justify-center rounded-full text-[12px] font-bold ${
          comment.isAuthor ? "bg-ink text-bg" : "bg-hairline"
        }`}
      >
        {initials(comment.authorName)}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="text-[13.5px] font-semibold">{comment.authorName}</span>
          {comment.isAuthor && (
            <span className="rounded-[3px] bg-hairline px-[6px] py-[1px] font-mono text-[10px] text-body">
              {t("author")}
            </span>
          )}
          <span className="text-[12px] text-placeholder">
            {timeAgo(comment.createdAt, locale)}
          </span>
        </div>
        <div className="mt-[3px] text-[14px] leading-[1.6] text-[#33322F] dark:text-body">
          {comment.body}
        </div>
        {canReply && (
          <button
            type="button"
            onClick={() => setReplying((v) => !v)}
            className="mt-[5px] text-[12px] font-semibold text-muted hover:text-ink"
          >
            {replying ? t("cancel") : t("reply")}
          </button>
        )}
        {replying && (
          <div className="mt-3">
            <CommentForm
              slug={slug}
              parentId={comment.id}
              onDone={() => setReplying(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export function CommentsSection({
  slug,
  comments,
  commentCount,
  locale,
}: {
  slug: string;
  comments: CommentItem[];
  commentCount: number;
  locale: string;
}) {
  const t = useTranslations("post");
  const topLevel = comments.filter((c) => !c.parentId);

  return (
    <section
      id="comments"
      className="mt-10 scroll-mt-16 border-t border-hairline pt-[22px] md:mt-12 md:pt-8"
    >
      <h3 className="mb-[14px] flex items-center gap-2 text-[15px] font-bold md:mb-5 md:text-[18px]">
        <CommentIcon size={16} className="hidden text-ink md:block" />
        {t("comments", { count: commentCount })}
      </h3>
      <div className="mb-6">
        <CommentForm slug={slug} parentId={null} />
      </div>
      <div className="flex flex-col gap-5">
        {topLevel.map((comment) => (
          <div key={comment.id} className="flex flex-col gap-5">
            <CommentRow
              comment={comment}
              slug={slug}
              locale={locale}
              isReply={false}
              canReply
            />
            {comments
              .filter((reply) => reply.parentId === comment.id)
              .map((reply) => (
                <CommentRow
                  key={reply.id}
                  comment={reply}
                  slug={slug}
                  locale={locale}
                  isReply
                  canReply={false}
                />
              ))}
          </div>
        ))}
      </div>
    </section>
  );
}
