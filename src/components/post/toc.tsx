"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { CommentIcon, ShareIcon } from "@/components/icons";
import type { TocItem } from "@/lib/toc";

function useActiveHeading(items: TocItem[]): string {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (headings.length === 0) return;

    const onScroll = () => {
      // active = last heading above the 96px scroll offset line
      let current = headings[0].id;
      for (const el of headings) {
        if (el.getBoundingClientRect().top <= 96) current = el.id;
      }
      setActiveId(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [items]);

  return activeId;
}

function scrollToId(id: string, updateHash = true) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  // deliberate navigation updates the URL; scrolling never does
  if (updateHash) history.pushState(null, "", `#${id}`);
}

/** Desktop right-rail TOC (design 2f) — sticky, active section highlighted. */
export function TocRail({ items }: { items: TocItem[] }) {
  const t = useTranslations("post");
  const activeId = useActiveHeading(items);
  if (items.length === 0) return null;

  return (
    <div className="sticky top-6 text-[13px]">
      <div className="mb-3 font-mono text-[11px] tracking-[0.08em] text-placeholder">
        {t("onThisPage")}
      </div>
      <div className="flex flex-col gap-[10px] border-l border-hairline">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => scrollToId(item.id)}
            className={
              item.id === activeId
                ? "-ml-[1.5px] border-l-2 border-ink pl-[14px] text-left font-semibold"
                : "pl-[14px] text-left text-muted hover:text-ink"
            }
          >
            {item.text}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Mobile sticky bottom bar (design 3b) — TOC sheet + comments/share. */
export function TocMobileBar({ items, title }: { items: TocItem[]; title: string }) {
  const t = useTranslations("post");
  const activeId = useActiveHeading(items);
  const [open, setOpen] = useState(false);

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
      } else {
        await navigator.clipboard.writeText(url);
      }
    } catch {
      // share cancelled — ignore
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 xl:hidden">
      {open && (
        <div className="border-t border-hairline bg-surface px-6 py-3">
          <div className="flex flex-col gap-[10px] border-l border-hairline">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setOpen(false);
                  scrollToId(item.id);
                }}
                className={
                  item.id === activeId
                    ? "-ml-[1.5px] border-l-2 border-ink pl-[14px] text-left text-[13px] font-semibold"
                    : "pl-[14px] text-left text-[13px] text-muted"
                }
              >
                {item.text}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="flex items-center justify-between border-t border-hairline bg-surface px-6 py-[10px]">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="font-mono text-[11px] text-muted"
        >
          {t("onThisPageMobile")} {open ? "▴" : "▾"}
        </button>
        <div className="flex gap-4 text-muted">
          <button
            type="button"
            aria-label={t("comments", { count: 0 })}
            onClick={() => {
              setOpen(false);
              scrollToId("comments", false);
            }}
          >
            <CommentIcon size={16} />
          </button>
          <button type="button" aria-label={t("share")} onClick={share}>
            <ShareIcon size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
