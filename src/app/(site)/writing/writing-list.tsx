"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useMemo, useRef, useState } from "react";
import { CommentIcon, EyeIcon, SearchIcon } from "@/components/icons";
import {
  formatPostDateLong,
  postExcerpt,
  postTitle,
  type PostListItem,
} from "@/lib/posts";

const PAGE_SIZE = 5;

export function WritingList({
  posts,
  locale,
}: {
  posts: PostListItem[];
  locale: string;
}) {
  const t = useTranslations("writingPage");
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const searchRef = useRef<HTMLInputElement>(null);

  const tagCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const post of posts) {
      for (const tag of post.tags) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [posts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((post) => {
      if (activeTag && !post.tags.includes(activeTag)) return false;
      if (!q) return true;
      return (
        postTitle(post, locale).toLowerCase().includes(q) ||
        postExcerpt(post, locale).toLowerCase().includes(q) ||
        post.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    });
  }, [posts, query, activeTag, locale]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pagePosts = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const nf = new Intl.NumberFormat(locale === "ko" ? "ko" : "en-GB");

  const selectTag = (tag: string | null) => {
    setActiveTag(tag);
    setPage(1);
  };

  return (
    <>
      {/* Search — ⌘K */}
      <div className="mb-5 flex items-center gap-[10px] rounded-[8px] border border-border bg-surface px-[14px] py-[10px]">
        <SearchIcon size={15} className="shrink-0 text-muted" />
        <input
          ref={searchRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          placeholder={t("searchPlaceholder")}
          className="w-full bg-transparent text-[14px] text-ink outline-none placeholder:text-placeholder"
        />
        <kbd className="ml-auto shrink-0 rounded-[4px] border border-hairline px-[6px] py-[2px] font-mono text-[11px] text-placeholder">
          ⌘K
        </kbd>
      </div>

      {/* Tag filter chips */}
      <div className="mb-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => selectTag(null)}
          className={
            activeTag === null
              ? "rounded-full bg-ink px-3 py-[5px] text-[13px] font-semibold text-bg"
              : "rounded-full border border-border px-3 py-[5px] text-[13px] text-body"
          }
        >
          {t("all")} {posts.length}
        </button>
        {tagCounts.map(([tag, count]) => (
          <button
            key={tag}
            type="button"
            onClick={() => selectTag(activeTag === tag ? null : tag)}
            className={
              activeTag === tag
                ? "rounded-full bg-ink px-3 py-[5px] text-[13px] font-semibold text-bg"
                : "rounded-full border border-border px-3 py-[5px] text-[13px] text-body"
            }
          >
            {tag} {count}
          </button>
        ))}
      </div>

      {/* Post rows */}
      <div className="flex flex-col">
        {pagePosts.map((post, i) => (
          <Link
            key={post.slug}
            href={`/writing/${post.slug}`}
            className={`group flex flex-col gap-[6px] py-5 ${
              i < pagePosts.length - 1 ? "border-b border-hairline" : ""
            }`}
          >
            <div className="flex items-center gap-2">
              {post.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="rounded-[4px] border border-hairline px-[7px] py-[2px] font-mono text-[11px] font-medium text-muted"
                >
                  {tag}
                </span>
              ))}
              <span className="font-mono text-[12px] text-placeholder">
                {formatPostDateLong(post.publishedAt, locale)}
              </span>
            </div>
            <div className="text-[16.5px] font-semibold leading-snug tracking-[-0.2px] group-hover:underline md:text-[18px]">
              {postTitle(post, locale)}
            </div>
            <div className="text-[14px] leading-[1.55] text-muted">
              {postExcerpt(post, locale)}
            </div>
            <div className="mt-[2px] flex items-center gap-4 text-[12.5px] text-placeholder">
              <span className="inline-flex items-center gap-[5px]">
                <EyeIcon size={13} strokeLinejoin="miter" />
                {nf.format(post.views)}
              </span>
              <span className="inline-flex items-center gap-[5px]">
                <CommentIcon size={13} />
                {nf.format(post.commentCount)}
              </span>
              <span>{t("readTime", { minutes: post.readMinutes })}</span>
            </div>
          </Link>
        ))}
        {pagePosts.length === 0 && (
          <div className="py-10 text-center text-[14px] text-muted">
            {t("empty")}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="mt-8 flex justify-center gap-[6px] font-mono text-[13px]">
          {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setPage(n)}
              className={`flex h-[30px] w-[30px] items-center justify-center rounded-[6px] ${
                n === currentPage ? "bg-ink text-bg" : "text-muted hover:text-ink"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
