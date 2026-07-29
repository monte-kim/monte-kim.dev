"use client";

import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { SearchIcon, Spinner } from "@/components/icons";
import { formatPostDateLong } from "@/lib/posts";

type SearchPost = {
  slug: string;
  titleEn: string;
  titleKo: string | null;
  excerptEn: string | null;
  excerptKo: string | null;
  tags: string[];
  publishedAt: string;
};

/** Global ⌘K post search — mounted once in the site layout. */
export function SearchModal() {
  const t = useTranslations("writingPage");
  const locale = useLocale();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const [posts, setPosts] = useState<SearchPost[] | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // load the index once, on first open
  useEffect(() => {
    if (!open || posts) return;
    fetch("/api/search")
      .then((res) => res.json())
      .then(setPosts)
      .catch(() => setPosts([]));
  }, [open, posts]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
        setQuery("");
        setSelected(0);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const title = useCallback(
    (post: SearchPost) =>
      locale === "ko" && post.titleKo ? post.titleKo : post.titleEn,
    [locale]
  );

  const q = query.trim().toLowerCase();
  const results = (posts ?? []).filter((post) => {
    if (!q) return true;
    const excerpt =
      (locale === "ko" && post.excerptKo ? post.excerptKo : post.excerptEn) ?? "";
    return (
      title(post).toLowerCase().includes(q) ||
      excerpt.toLowerCase().includes(q) ||
      post.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  });

  const go = (slug: string) => {
    setOpen(false);
    router.push(`/writing/${slug}`);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/30 p-4 pt-[12vh]"
      onClick={() => setOpen(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="mx-auto w-full max-w-[560px] overflow-hidden rounded-[12px] border border-border bg-surface shadow-menu"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-[10px] border-b border-hairline px-4 py-3">
          <SearchIcon size={15} className="shrink-0 text-muted" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelected(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelected((s) => Math.min(s + 1, results.length - 1));
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelected((s) => Math.max(s - 1, 0));
              }
              if (e.key === "Enter" && results[selected]) {
                go(results[selected].slug);
              }
            }}
            placeholder={t("searchPlaceholder")}
            className="w-full bg-transparent text-[15px] text-ink outline-none placeholder:text-placeholder"
          />
          <kbd className="shrink-0 rounded-[4px] border border-hairline px-[6px] py-[2px] font-mono text-[11px] text-placeholder">
            esc
          </kbd>
        </div>
        <div className="max-h-[320px] overflow-y-auto py-2">
          {!posts && (
            <div className="flex justify-center py-6">
              <Spinner size={16} className="text-muted" />
            </div>
          )}
          {results.map((post, i) => (
            <button
              key={post.slug}
              type="button"
              onMouseEnter={() => setSelected(i)}
              onClick={() => go(post.slug)}
              className={`flex w-full flex-col gap-[3px] px-4 py-[10px] text-left ${
                i === selected ? "bg-subtle" : ""
              }`}
            >
              <span className="text-[14.5px] font-semibold leading-snug">
                {title(post)}
              </span>
              <span className="font-mono text-[11.5px] text-placeholder">
                {formatPostDateLong(post.publishedAt, locale)}
                {post.tags.length > 0 && ` · ${post.tags.join(" · ")}`}
              </span>
            </button>
          ))}
          {posts && results.length === 0 && (
            <div className="px-4 py-6 text-center text-[13.5px] text-muted">
              {t("empty")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
