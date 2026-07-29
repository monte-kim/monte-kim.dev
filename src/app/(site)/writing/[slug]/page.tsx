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

const SITE_DESCRIPTION =
  "Production war stories by Tae Hwan \"Monte\" Kim — backend architecture, AWS, and the occasional retrospective.";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostDetail(slug);
  // metadata runs before streaming starts, so this returns a real 404 status
  // (notFound() in the page body would stream a 404 UI with a 200 code)
  if (!post) notFound();
  // fall back to the site line when the auto-excerpt is missing or too thin
  const description =
    post.excerptEn && post.excerptEn.length >= 40
      ? post.excerptEn
      : SITE_DESCRIPTION;
  return {
    title: `${post.titleEn} — monte-kim.dev`,
    description,
    openGraph: {
      // page-level openGraph replaces the root one wholesale (shallow merge),
      // so siteName must be repeated here
      siteName: "monte-kim.dev",
      title: post.titleEn,
      description,
      type: "article",
      images: [
        {
          // uploaded cover wins; otherwise the generated card
          url: post.coverUrl ?? `/api/og?slug=${encodeURIComponent(slug)}`,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: { card: "summary_large_image" },
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
      {/* article column sits at true page center; TOC rail floats to its right (xl+) */}
      <div className="relative px-6 pb-[92px] pt-7 md:px-10 md:pt-14 xl:pb-16">
        <article className="mx-auto min-w-0 max-w-[720px]">
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
          <div
            className={`hidden items-center gap-4 border-b border-hairline pb-6 text-[13px] text-muted md:flex ${
              post.coverUrl ? "mb-7" : "mb-8"
            }`}
          >
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
          <div
            className={`border-b border-hairline pb-[18px] font-mono text-[11px] text-placeholder md:hidden ${
              post.coverUrl ? "mb-5" : "mb-[22px]"
            }`}
          >
            {date} · {t("minShort", { minutes: post.readMinutes })} ·{" "}
            {t("views", { count: nf.format(post.views) })}
          </div>

          {/* cover (design 2j/3e) — below meta, content width, 1.91:1 */}
          {post.coverUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.coverUrl}
              alt=""
              className="mb-5 aspect-[1200/630] w-full rounded-[9px] border border-hairline object-cover md:mb-8 md:rounded-[10px]"
            />
          )}

          <PostContent doc={post.content} />

          <CommentsSection
            slug={post.slug}
            comments={comments}
            commentCount={post.commentCount}
            locale={locale}
          />
        </article>

        {/* TOC right rail — wide screens only; narrower widths get the bottom bar */}
        <aside className="absolute bottom-0 top-0 hidden w-[220px] xl:left-[calc(50%+408px)] xl:block">
          <div className="h-full pt-[176px]">
            <TocRail items={toc} />
          </div>
        </aside>
      </div>

      <TocMobileBar items={toc} title={title} />
    </>
  );
}
