"use client";

import { LogoMark } from "@/components/logo";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useLocale, useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { setLocale } from "@/app/actions/locale";
import { CloseIcon, MenuIcon, MoonIcon, SunIcon } from "./icons";

const NAV = [
  { href: "/", key: "home" },
  { href: "/writing", key: "writing" },
  { href: "/projects", key: "projects" },
  { href: "/about", key: "about" },
] as const;

function LocaleToggle({ className = "" }: { className?: string }) {
  const locale = useLocale();
  const [, startTransition] = useTransition();

  return (
    <div
      className={`flex overflow-hidden rounded-[6px] border border-border text-[12px] font-semibold ${className}`}
    >
      {(["en", "ko"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => startTransition(() => setLocale(l))}
          className={
            locale === l
              ? "bg-ink px-[9px] py-[4px] text-bg"
              : "px-[9px] py-[4px] text-muted"
          }
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

function ThemeToggle({ size = 17 }: { size?: number }) {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="flex items-center text-ink"
    >
      <MoonIcon size={size} strokeLinejoin="miter" className="dark:hidden" />
      <SunIcon size={size} className="hidden dark:block" />
    </button>
  );
}

export function Header() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-bg">
      {/* Desktop — 60px */}
      <div className="hidden h-[60px] items-center justify-between px-10 md:flex">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-[9px]">
            <LogoMark size={26} className="text-ink" />
            <span className="text-[15px] font-semibold">monte-kim.dev</span>
          </Link>
          <nav className="flex gap-6 text-[14px] text-muted">
            {NAV.map(({ href, key }) => (
              <Link
                key={key}
                href={href}
                className={isActive(href) ? "font-medium text-ink" : "hover:text-ink"}
              >
                {t(key)}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-[14px]">
          <LocaleToggle />
          <ThemeToggle />
          <Link
            href="/say-hi"
            className="rounded-[7px] bg-ink px-[14px] py-[7px] text-[13px] font-semibold text-bg"
          >
            {t("sayHi")}
          </Link>
        </div>
      </div>

      {/* Mobile — 54px */}
      <div className="flex h-[54px] items-center justify-between px-5 md:hidden">
        <Link href="/" className="flex items-center gap-2">
          <LogoMark size={24} className="text-ink" />
          <span className="text-[14px] font-semibold">monte-kim.dev</span>
        </Link>
        <div className="flex items-center gap-[14px]">
          <ThemeToggle />
          <button
            type="button"
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
            className="flex items-center text-ink"
          >
            {open ? <CloseIcon size={18} /> : <MenuIcon size={18} strokeLinejoin="miter" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-hairline bg-bg px-5 pb-5 pt-2 md:hidden">
          <nav className="flex flex-col">
            {NAV.map(({ href, key }) => (
              <Link
                key={key}
                href={href}
                onClick={() => setOpen(false)}
                className={`border-b border-hairline py-3 text-[15px] ${
                  isActive(href) ? "font-semibold text-ink" : "text-muted"
                }`}
              >
                {t(key)}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex items-center justify-between">
            <LocaleToggle />
            <Link
              href="/say-hi"
              onClick={() => setOpen(false)}
              className="rounded-[7px] bg-ink px-[14px] py-[7px] text-[13px] font-semibold text-bg"
            >
              {t("sayHi")}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
