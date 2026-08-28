import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { getWritingIndex } from "@/lib/posts";
import { WritingList } from "./writing-list";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Writing — monte-kim.dev",
  description:
    "Production war stories by Monte Kim. Backend architecture, AWS, and the occasional retrospective.",
};

export default async function WritingPage() {
  const [t, locale, posts] = await Promise.all([
    getTranslations("writingPage"),
    getLocale(),
    getWritingIndex(),
  ]);

  return (
    <div className="mx-auto max-w-[720px] px-6 pb-16 pt-10 md:px-10 md:pt-14">
      <h1 className="mb-2 text-[28px] font-bold tracking-[-1px] md:text-[34px]">
        {t("title")}
      </h1>
      <p className="mb-7 text-[15px] text-muted">{t("subtitle")}</p>
      <WritingList posts={posts} locale={locale} />
    </div>
  );
}
