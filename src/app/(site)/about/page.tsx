import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ClockIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "About — monte-kim.dev",
};

const TIMELINE_KEYS = ["moty", "muroom", "nhn", "university"] as const;

const TOOLS = [
  "Java · Spring Boot",
  "PostgreSQL · PostGIS",
  "TypeScript · Next.js",
  "AWS · Terraform",
  "Redis",
  "GitHub Actions",
];

export default async function AboutPage() {
  const t = await getTranslations("aboutPage");

  return (
    <div className="mx-auto max-w-[680px] px-6 pb-16 pt-10 md:px-10 md:pt-14">
      <h1 className="mb-5 text-[28px] font-bold tracking-[-1px] md:text-[34px]">
        {t("title")}
      </h1>
      <p className="mb-4 text-[15px] leading-[1.7] text-[#33322F] dark:text-body md:text-[16px] md:leading-[1.75]">
        {t("p1")}
      </p>
      <p className="mb-4 text-[15px] leading-[1.7] text-[#33322F] dark:text-body md:text-[16px] md:leading-[1.75]">
        {t("p2")}
      </p>

      {/* Now callout */}
      <div className="my-7 flex items-start gap-3 rounded-[10px] border border-hairline bg-surface px-5 py-[18px]">
        <ClockIcon size={16} className="mt-[2px] flex-none text-ink" />
        <div>
          <div className="mb-[3px] text-[13px] font-bold">{t("nowTitle")}</div>
          <div className="text-[14px] leading-[1.6] text-body">
            {t.rich("nowBody", {
              b: (chunks) => <strong className="text-ink">{chunks}</strong>,
            })}
          </div>
        </div>
      </div>

      {/* Path so far */}
      <h2 className="mb-[18px] mt-9 text-[20px] font-bold tracking-[-0.3px]">
        {t("pathTitle")}
      </h2>
      <div className="flex flex-col">
        {TIMELINE_KEYS.map((key, i) => (
          <div
            key={key}
            className={`grid grid-cols-[92px_1fr] gap-4 py-[14px] md:grid-cols-[120px_1fr] md:gap-5 ${
              i < TIMELINE_KEYS.length - 1 ? "border-b border-hairline" : ""
            }`}
          >
            <span className="pt-[2px] font-mono text-[12px] text-muted">
              {t(`timeline.${key}.period`)}
            </span>
            <div>
              <div className="text-[15px] font-semibold">
                {t(`timeline.${key}.role`)}
              </div>
              <div className="mt-[3px] text-[13.5px] leading-[1.55] text-muted">
                {t(`timeline.${key}.desc`)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tools */}
      <h2 className="mb-[14px] mt-9 text-[20px] font-bold tracking-[-0.3px]">
        {t("toolsTitle")}
      </h2>
      <div className="flex flex-wrap gap-[7px]">
        {TOOLS.map((tool) => (
          <span
            key={tool}
            className="rounded-full border border-border px-3 py-[5px] text-[13px] text-body"
          >
            {tool}
          </span>
        ))}
      </div>

      {/* CTA — CV download intentionally omitted */}
      <div className="mt-9 flex gap-3">
        <Link
          href="/say-hi"
          className="inline-flex items-center gap-2 rounded-[8px] bg-ink px-[18px] py-[10px] text-[14px] font-semibold text-bg"
        >
          {t("sayHi")}
        </Link>
      </div>
    </div>
  );
}
