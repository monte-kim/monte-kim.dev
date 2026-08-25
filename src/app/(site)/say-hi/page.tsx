import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { MailIcon } from "@/components/icons";
import { SayHiForm } from "./say-hi-form";

export const metadata: Metadata = {
  title: "Say hi — monte-kim.dev",
  description:
    "Hiring in London, curious about a post, or want to talk PostGIS or music production? I reply to everything.",
};

export default async function SayHiPage() {
  const t = await getTranslations("sayHiPage");

  return (
    <div className="mx-auto max-w-[520px] px-6 pb-16 pt-12 text-center md:px-10 md:pb-20 md:pt-[72px]">
      <h1 className="mb-[10px] text-[28px] font-bold tracking-[-1px] md:text-[34px]">
        {t("title")}
      </h1>
      <p className="mb-9 text-[15px] leading-[1.6] text-muted">{t("subtitle")}</p>
      <SayHiForm />
      <div className="mt-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13.5px] text-muted">
        <a
          href="mailto:monte6198@gmail.com"
          className="inline-flex items-center gap-[6px] hover:text-ink"
        >
          <MailIcon size={15} />
          monte6198@gmail.com
        </a>
        <a
          href="https://github.com/monte-kim"
          target="_blank"
          rel="noreferrer noopener"
          className="hover:text-ink"
        >
          GitHub ↗
        </a>
        <a
          href="https://www.linkedin.com/in/monte-kim/"
          target="_blank"
          rel="noreferrer noopener"
          className="hover:text-ink"
        >
          LinkedIn ↗
        </a>
      </div>
    </div>
  );
}
