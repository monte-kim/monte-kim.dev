import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { ActivityIcon, ArrowRightIcon, MusicIcon } from "@/components/icons";
import { formatPostDate, getRecentPosts, postTitle } from "@/lib/posts";

export const revalidate = 60;

export default async function Home() {
  const [t, locale, posts] = await Promise.all([
    getTranslations("home"),
    getLocale(),
    getRecentPosts(3),
  ]);

  const nf = new Intl.NumberFormat(locale === "ko" ? "ko" : "en-GB");

  const stats = [
    { value: t("stat1Value"), label: t("stat1Label"), short: t("stat1LabelShort") },
    { value: t("stat2Value"), label: t("stat2Label"), short: t("stat2LabelShort") },
    { value: t("stat3Value"), label: t("stat3Label"), short: t("stat3LabelShort") },
  ];

  const projects = [
    { icon: MusicIcon, title: t("muroomTitle"), desc: t("muroomDesc") },
    { icon: ActivityIcon, title: t("fitnessTitle"), desc: t("fitnessDesc") },
  ];

  return (
    <>
      {/* Hero */}
      <section className="mx-auto max-w-[680px] px-6 pb-9 pt-12 text-center md:px-10 md:pb-14 md:pt-[88px]">
        <h1 className="mb-[14px] text-[30px] font-bold leading-[1.15] tracking-[-1px] md:mb-5 md:text-[46px] md:leading-[1.1] md:tracking-[-1.6px]">
          {t("titleL1")}
          <br />
          <span className="md:hidden">
            {t("titleL2a")}
            <br />
            {t("titleL2b")}
          </span>
          <span className="hidden md:inline">{t("titleL2")}</span>
        </h1>
        <p className="mx-auto mb-[22px] max-w-[540px] text-[14.5px] leading-[1.6] text-body md:mb-[30px] md:text-[17px] md:leading-[1.65] md:[text-wrap:pretty]">
          <span className="md:hidden">{t("introShort")}</span>
          <span className="hidden md:inline">{t("intro")}</span>
        </p>
        <div className="flex flex-col gap-[10px] md:flex-row md:items-center md:justify-center md:gap-3">
          <Link
            href="/writing"
            className="flex items-center justify-center gap-2 rounded-[9px] bg-ink p-[13px] text-[14px] font-semibold text-bg md:inline-flex md:rounded-[8px] md:px-[18px] md:py-[10px]"
          >
            {t("readBlog")} <ArrowRightIcon size={14} />
          </Link>
          <Link
            href="/say-hi"
            className="flex items-center justify-center gap-2 rounded-[9px] border border-btn2-border p-[13px] text-[14px] font-semibold md:inline-flex md:rounded-[8px] md:px-[18px] md:py-[10px]"
          >
            {t("sayHi")}
          </Link>
        </div>
        <div className="mt-4 font-mono text-[11px] text-muted md:mt-[22px] md:text-[12.5px]">
          <span className="md:hidden">{t("availabilityShort")}</span>
          <span className="hidden md:inline">{t("availability")}</span>
        </div>
      </section>

      {/* Stat strip */}
      <section className="mx-auto max-w-[720px] px-6 md:px-10">
        <div className="grid grid-cols-3 gap-px overflow-hidden rounded-[10px] border border-hairline bg-hairline">
          {stats.map((stat) => (
            <div
              key={stat.value}
              className="bg-surface px-[10px] py-3 text-center md:px-5 md:py-[18px] md:text-left"
            >
              <div className="font-mono text-[17px] font-semibold md:text-[22px]">
                {stat.value}
              </div>
              <div className="mt-[2px] text-[10.5px] text-muted md:mt-[3px] md:text-[13px]">
                <span className="md:hidden">{stat.short}</span>
                <span className="hidden md:inline">{stat.label}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent writing */}
      <section className="mx-auto max-w-[720px] px-6 pb-10 pt-8 md:px-10 md:pt-12">
        <div className="mb-1 flex items-baseline justify-between md:mb-2">
          <h2 className="text-[17px] font-bold md:text-[20px] md:tracking-[-0.3px]">
            {t("writing")}
          </h2>
          <Link href="/writing" className="text-[12.5px] text-muted hover:text-ink md:text-[13px]">
            <span className="md:hidden">{t("allShort")}</span>
            <span className="hidden md:inline">{t("allPosts")}</span>
          </Link>
        </div>
        <div className="flex flex-col">
          {posts.map((post, i) => (
            <Link
              key={post.slug}
              href={`/writing/${post.slug}`}
              className={`group py-[13px] md:flex md:items-baseline md:justify-between md:gap-6 md:py-[14px] ${
                i < posts.length - 1 ? "border-b border-hairline" : ""
              }`}
            >
              <span className="block text-[14.5px] font-semibold leading-[1.4] group-hover:underline md:text-[15.5px]">
                {postTitle(post, locale)}
              </span>
              <span className="mt-1 block font-mono text-[11px] text-placeholder md:hidden">
                {formatPostDate(post.publishedAt, locale)} ·{" "}
                {t("minRead", { minutes: post.readMinutes })} ·{" "}
                {t("views", { count: nf.format(post.views) })}
              </span>
              <span className="hidden whitespace-nowrap font-mono text-[12px] text-muted md:block">
                {formatPostDate(post.publishedAt, locale)}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Project preview */}
      <section className="mx-auto max-w-[720px] px-6 pb-14 md:px-10">
        <div className="mb-[14px] flex items-baseline justify-between">
          <h2 className="text-[17px] font-bold md:text-[20px] md:tracking-[-0.3px]">
            {t("projects")}
          </h2>
          <Link href="/projects" className="text-[12.5px] text-muted hover:text-ink md:text-[13px]">
            <span className="md:hidden">{t("allShort")}</span>
            <span className="hidden md:inline">{t("allProjects")}</span>
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-[14px] md:grid-cols-2">
          {projects.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-[10px] border border-hairline bg-surface p-5"
            >
              <div className="mb-2 flex items-center gap-[9px]">
                <Icon size={16} className="text-ink" />
                <span className="text-[15.5px] font-bold">{title}</span>
              </div>
              <div className="text-[13.5px] leading-[1.55] text-muted">{desc}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
