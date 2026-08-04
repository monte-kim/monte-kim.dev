import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowLeftIcon, ArrowRightIcon, GithubIcon } from "@/components/icons";
import {
  PROJECT_DETAILS,
  pick,
  type DiagramNode,
} from "@/data/project-details";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return Object.keys(PROJECT_DETAILS).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = PROJECT_DETAILS[slug];
  if (!project) return { title: "monte-kim.dev" };
  return {
    title: `${project.name} — Projects — monte-kim.dev`,
    description: project.oneLiner.en,
  };
}

function Node({ node, dashed }: { node: DiagramNode; dashed?: boolean }) {
  return (
    <div
      className={`rounded-[8px] text-center font-mono ${
        node.emphasis
          ? "border-[1.5px] border-ink bg-surface px-4 py-[9px] text-[11.5px] font-semibold md:px-5 md:py-[11px] md:text-[12px]"
          : dashed
            ? "border border-dashed border-border bg-bg px-3 py-[7px] text-[11px] text-body"
            : "border border-border bg-bg px-3 py-2 text-[10.5px] md:px-4 md:py-[9px] md:text-[11.5px]"
      }`}
    >
      {node.label}
      {node.sub && (
        <>
          <br />
          <span className="text-muted">{node.sub}</span>
        </>
      )}
    </div>
  );
}

const Connector = ({ h = "h-4 md:h-5" }: { h?: string }) => (
  <div className={`w-px bg-border ${h}`} />
);

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = PROJECT_DETAILS[slug];
  if (!project) notFound();

  const [t, locale] = await Promise.all([
    getTranslations("projectDetail"),
    getLocale(),
  ]);

  const sectionTitle =
    "mb-[14px] text-[19px] font-bold tracking-[-0.3px] md:text-[22px] md:tracking-[-0.4px]";

  return (
    <div className="pb-16 md:pb-0">
      <div className="mx-auto max-w-[760px] px-6 pt-7 md:px-10 md:pt-[52px]">
        {/* hero */}
        <Link
          href="/projects"
          className="mb-4 inline-flex items-center gap-[6px] text-[12.5px] text-muted hover:text-ink md:mb-[22px] md:text-[13px]"
        >
          <ArrowLeftIcon size={13} />
          {t("breadcrumb")}
        </Link>
        <div className="mb-[10px] flex flex-wrap items-center gap-2 md:mb-[14px] md:gap-[10px]">
          <h1 className="text-[28px] font-bold tracking-[-0.9px] md:text-[38px] md:tracking-[-1.2px]">
            {project.name}
          </h1>
          <span className="rounded-full bg-ink px-2 py-[2px] font-mono text-[10px] text-bg md:px-[9px] md:py-[3px] md:text-[10.5px]">
            {project.badge}
          </span>
          <span className="hidden rounded-full border border-hairline bg-subtle px-[9px] py-[3px] font-mono text-[10.5px] text-muted md:inline-block">
            {pick(project.statusPill, locale)}
          </span>
        </div>
        <span className="mb-[14px] inline-block rounded-full border border-hairline bg-subtle px-2 py-[2px] font-mono text-[10.5px] text-muted md:hidden">
          {pick(project.statusPill, locale)}
        </span>
        <p className="mb-5 text-pretty text-[15.5px] leading-[1.6] text-body md:mb-6 md:text-[18px]">
          {pick(project.oneLiner, locale)}
        </p>
        <div className="mb-7 flex flex-col gap-[10px] md:mb-0 md:flex-row md:items-center md:gap-3">
          <Link
            href={project.caseStudyHref}
            className="inline-flex items-center justify-center gap-2 rounded-[9px] bg-ink p-[13px] text-[14px] font-semibold text-bg md:rounded-[8px] md:px-[18px] md:py-[10px]"
          >
            {t("caseStudy")}
            <ArrowRightIcon size={14} />
          </Link>
          <a
            href={project.githubHref}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center justify-center gap-2 rounded-[9px] border border-border p-[13px] text-[14px] font-semibold md:rounded-[8px] md:px-[18px] md:py-[10px]"
          >
            <GithubIcon size={15} />
            GitHub ↗
          </a>
        </div>

        {/* stat strip — 5 stats: 3 + 2 on desktop, 2-col on mobile */}
        <div className="md:mt-10">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[10px] border border-hairline bg-hairline md:grid-cols-6">
            {project.stats.map((stat, i) => (
              <div
                key={stat.value}
                className={`bg-surface p-[13px] md:px-[18px] md:py-4 ${
                  i < 3 ? "md:col-span-2" : "md:col-span-3"
                } ${i === 4 ? "col-span-2 md:col-span-3" : ""}`}
              >
                <div className="font-mono text-[17px] font-semibold md:text-[20px]">
                  {stat.value}
                </div>
                <div className="mt-[2px] text-[11.5px] text-muted md:text-[12.5px]">
                  {pick(stat.label, locale)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* product */}
        <section className="mt-7 md:mt-12">
          <h2 className={sectionTitle}>{t("product")}</h2>
          {project.product.map((paragraph, i) => (
            <p
              key={i}
              className="mb-4 text-[15px] leading-[1.7] text-[#33322F] dark:text-body md:text-[16px] md:leading-[1.75]"
            >
              {pick(paragraph, locale)}
            </p>
          ))}
          <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-[14px]">
            {project.screenshots.map((shot) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={shot.src}
                src={shot.src}
                alt={pick(shot.alt, locale)}
                className={`aspect-[16/10] w-full rounded-[9px] border border-border object-cover shadow-card md:rounded-[10px] ${
                  shot.mobile ? "" : "hidden md:block"
                }`}
              />
            ))}
          </div>
        </section>

        {/* architecture */}
        <section className="mt-7 md:mt-12">
          <h2 className={sectionTitle}>{t("architecture")}</h2>
          <p className="mb-6 text-[15px] leading-[1.7] text-[#33322F] dark:text-body md:text-[16px] md:leading-[1.75]">
            {pick(project.architecture.overview, locale)}
          </p>
          <div className="rounded-[10px] border border-hairline bg-surface px-4 py-5 md:px-6 md:py-7">
            <div className="flex flex-col items-center">
              {project.architecture.chain.map((node) => (
                <div key={node.label} className="flex flex-col items-center">
                  <Node node={node} />
                  <Connector />
                </div>
              ))}
              {/* branch: centered horizontal bar, then two columns */}
              <div className="mx-auto h-px w-1/2 bg-border" />
              <div className="-mt-px grid w-full grid-cols-2 gap-3 md:gap-4">
                {project.architecture.branch.map((node) => (
                  <div key={node.label} className="flex flex-col items-center">
                    <Connector h="h-[18px]" />
                    <Node node={node} />
                  </div>
                ))}
              </div>
            </div>
            <div className="my-5 border-t border-dashed border-border md:my-6" />
            <div className="flex flex-wrap justify-center gap-2 md:gap-[10px]">
              {project.architecture.supporting.map((node) => (
                <Node key={node.label} node={node} dashed />
              ))}
            </div>
            <div className="mt-4 text-center font-mono text-[10.5px] text-placeholder">
              {project.architecture.caption}
            </div>
          </div>
        </section>

        {/* stack */}
        <section className="mt-7 md:mt-12">
          <h2 className={sectionTitle}>{t("stack")}</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-x-8">
            {project.stack.map(({ group, items }) => (
              <div key={group}>
                <div className="mb-[10px] font-mono text-[11px] tracking-[0.08em] text-placeholder">
                  {group}
                </div>
                <div className="flex flex-wrap gap-[7px]">
                  {items.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-border px-3 py-[5px] text-[13px] text-body"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* roles */}
        <section className="mt-7 md:mt-12">
          <h2 className="mb-[6px] text-[19px] font-bold tracking-[-0.3px] md:text-[22px] md:tracking-[-0.4px]">
            {t("roles")}
          </h2>
          <p className="mb-[18px] text-[13.5px] text-muted md:text-[14px]">
            {pick(project.rolesSub, locale)}
          </p>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-[14px]">
            {project.roles.map((role) => (
              <div
                key={role.title.en}
                className={`rounded-[10px] bg-surface px-4 py-[14px] md:px-5 md:py-[18px] ${
                  role.mine ? "border-[1.5px] border-ink" : "border border-hairline"
                }`}
              >
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-[14px] font-bold md:text-[14.5px]">
                    {pick(role.title, locale)}
                  </span>
                  {role.badge && (
                    <span className="rounded-full bg-ink px-[7px] py-[2px] font-mono text-[10px] text-bg">
                      {role.badge}
                    </span>
                  )}
                </div>
                <div className="text-[13px] leading-[1.6] text-body md:text-[13.5px]">
                  {pick(role.body, locale)}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* timeline */}
        <section className="mt-7 md:mt-12">
          <h2 className={sectionTitle}>{t("timeline")}</h2>
          <div className="flex flex-col">
            {project.timeline.map((item, i) => (
              <div
                key={`${item.period}-${item.title.en}`}
                className={`py-[14px] ${
                  i < project.timeline.length - 1 ? "border-b border-hairline" : ""
                } ${item.mobile ? "" : "hidden md:block"}`}
              >
                <div className="grid gap-1 md:grid-cols-[120px_1fr] md:gap-5">
                  <span className="pt-[2px] font-mono text-[11px] text-placeholder md:text-[12px] md:text-muted">
                    {item.period}
                  </span>
                  <div>
                    <div className="text-[14.5px] font-semibold md:text-[15px]">
                      {pick(item.title, locale)}
                    </div>
                    <div className="mt-[3px] hidden text-[13.5px] leading-[1.55] text-muted md:block">
                      {pick(item.desc, locale)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* decisions */}
        <section className="mt-7 md:mt-12">
          <h2 className={sectionTitle}>{t("decisions")}</h2>
          <div className="flex flex-col gap-[10px] md:gap-3">
            {project.decisions.map((decision) => (
              <div
                key={decision.title.en}
                className="rounded-[10px] border border-hairline bg-surface px-4 py-[14px] md:px-[18px] md:py-4"
              >
                <div className="mb-[5px] text-[14.5px] font-semibold md:text-[15px]">
                  {pick(decision.title, locale)}
                </div>
                <div className="text-[13px] leading-[1.6] text-body md:text-[13.5px]">
                  {pick(decision.body, locale)}
                </div>
                {decision.href && (
                  <Link
                    href={decision.href}
                    className="mt-2 inline-flex items-center gap-[5px] text-[12.5px] font-semibold hover:underline md:text-[13px]"
                  >
                    {t("readPost")}
                    <ArrowRightIcon size={12} />
                  </Link>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* footer CTA */}
        <section className="mt-7 pb-10 md:mt-12 md:pb-16">
          <div className="flex flex-col gap-5 rounded-[12px] border border-hairline bg-surface p-6 md:flex-row md:items-center md:justify-between md:gap-6 md:p-7">
            <div>
              <div className="mb-[5px] text-[16px] font-bold md:text-[17px]">
                {pick(project.footerCta.title, locale)}
              </div>
              <div className="text-[13.5px] leading-[1.55] text-muted md:text-[14px]">
                {pick(project.footerCta.sub, locale)}
              </div>
            </div>
            <div className="flex flex-none flex-col gap-[10px] md:flex-row">
              <Link
                href={project.footerCta.seriesHref}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[8px] bg-ink px-[18px] py-[10px] text-[14px] font-semibold text-bg"
              >
                {t("readSeries")}
                <ArrowRightIcon size={14} />
              </Link>
              <Link
                href="/say-hi"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-[8px] border border-border px-[18px] py-[10px] text-[14px] font-semibold"
              >
                {t("sayHi")}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
