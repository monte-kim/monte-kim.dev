import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowLeftIcon, CalendarIcon, EyeIcon } from "@/components/icons";
import { CommentsSection } from "@/components/post/comments-section";
import { PostContent } from "@/components/post/post-content";
import { TocMobileBar, TocRail } from "@/components/post/toc";
import { ViewTracker } from "@/components/post/view-tracker";
import {
  formatPostDateLong,
  getComments,
  getPostDetail,
  postTitle,
} from "@/lib/posts";
import { extractToc } from "@/lib/toc";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostDetail(slug);
  if (!post) return { title: "monte-kim.dev" };
  return {
    title: `${post.titleEn} — monte-kim.dev`,
    description: post.excerptEn ?? undefined,
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const [t, locale, post, comments] = await Promise.all([
    getTranslations("post"),
    getLocale(),
    getPostDetail(slug),
    getComments(slug),
  ]);

  if (!post) notFound();

  const title = postTitle(post, locale);
  const toc = extractToc(post.content);
  const nf = new Intl.NumberFormat(locale === "ko" ? "ko" : "en-GB");
  const date = formatPostDateLong(post.publishedAt, locale);

  return (
    <>
      <ViewTracker slug={post.slug} />
      <div className="mx-auto grid max-w-[960px] grid-cols-1 px-6 pb-[92px] pt-7 md:grid-cols-[1fr_220px] md:gap-12 md:px-10 md:pb-16 md:pt-14">
        <article className="min-w-0">
          {/* breadcrumb */}
          <Link
            href="/writing"
            className="mb-4 inline-flex items-center gap-[6px] text-[12.5px] text-muted hover:text-ink md:mb-5 md:text-[13px]"
          >
            <ArrowLeftIcon size={13} />
            {t("allPosts")}
          </Link>

          {/* tags */}
          {post.tags.length > 0 && (
            <div className="mb-3 flex items-center gap-[6px] md:mb-[14px] md:gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-[4px] border border-hairline px-[7px] py-[2px] font-mono text-[10.5px] font-medium text-muted md:text-[11px]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <h1 className="mb-3 text-pretty text-[24px] font-bold leading-[1.2] tracking-[-0.6px] md:mb-4 md:text-[34px] md:leading-[1.15] md:tracking-[-1px]">
            {title}
          </h1>

          {/* meta — desktop */}
          <div className="mb-8 hidden items-center gap-4 border-b border-hairline pb-6 text-[13px] text-muted md:flex">
            <span className="inline-flex items-center gap-[6px]">
              <CalendarIcon size={13} />
              {date}
            </span>
            <span>{t("readTime", { minutes: post.readMinutes })}</span>
            <span className="inline-flex items-center gap-[6px]">
              <EyeIcon size={13} strokeLinejoin="miter" />
              {t("views", { count: nf.format(post.views) })}
            </span>
          </div>

          {/* meta — mobile */}
          <div className="mb-[22px] border-b border-hairline pb-[18px] font-mono text-[11px] text-placeholder md:hidden">
            {date} · {t("minShort", { minutes: post.readMinutes })} ·{" "}
            {t("views", { count: nf.format(post.views) })}
          </div>

          <PostContent doc={post.content} />

          <CommentsSection
            slug={post.slug}
            comments={comments}
            commentCount={post.commentCount}
            locale={locale}
          />
        </article>

        {/* TOC right rail — desktop */}
        <aside className="hidden pt-[120px] md:block">
          <TocRail items={toc} />
        </aside>
      </div>

      <TocMobileBar items={toc} title={title} />
    </>
  );
}
