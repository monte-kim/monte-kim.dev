import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import {
  ActivityIcon,
  ArrowRightIcon,
  BarChartIcon,
  CodeIcon,
  MusicIcon,
} from "@/components/icons";

export const metadata: Metadata = {
  title: "Projects — monte-kim.dev",
};

type Project = {
  key: string;
  name: string;
  badge: string;
  badgeFilled?: boolean;
  icon: ReactNode;
  stack: string[];
  caseStudy?: string; // fallback sample slugs — swap for real posts once published
  github?: string;
};

const PROJECTS: Project[] = [
  {
    key: "muroom",
    name: "Muroom",
    badge: "Founder",
    badgeFilled: true,
    icon: <MusicIcon size={16} />,
    stack: ["Spring Boot", "PostGIS", "Terraform"],
    // TODO caseStudy: "/writing/muroom-aws-on-pocket-money" once the post is published
    // TODO github: switch to muroom-backend-bach after the repo goes public (Aug teardown)
    github: "https://github.com/muroom-studio",
  },
  {
    key: "fitness",
    name: "Fitness platform API",
    badge: "Moty",
    icon: <ActivityIcon size={16} />,
    stack: ["Java 21", "ECS", "TimescaleDB"],
    // TODO caseStudy: link once the Moty case study is published
  },
  {
    key: "site",
    name: "monte-kim.dev",
    badge: "This site",
    icon: <CodeIcon size={16} />,
    stack: ["Next.js", "Supabase", "Vercel"],
    github: "https://github.com/monte-kim/monte-kim.dev",
  },
  {
    key: "newsClassifier",
    name: "News classifier MLOps",
    badge: "Bronze",
    icon: <BarChartIcon size={16} />,
    stack: ["FastAPI", "React", "MLOps"],
    github: "https://github.com/monte-kim",
  },
];

export default async function ProjectsPage() {
  const t = await getTranslations("projectsPage");

  return (
    <div className="mx-auto max-w-[760px] px-6 pb-16 pt-10 md:px-10 md:pt-14">
      <h1 className="mb-2 text-[28px] font-bold tracking-[-1px] md:text-[34px]">
        {t("title")}
      </h1>
      <p className="mb-8 text-[15px] text-muted">{t("subtitle")}</p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {PROJECTS.map((project) => (
          <div
            key={project.key}
            className="flex flex-col gap-[10px] rounded-[12px] border border-hairline bg-surface p-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-[10px]">
                <span className="flex h-[34px] w-[34px] items-center justify-center rounded-[8px] border border-hairline text-ink">
                  {project.icon}
                </span>
                <span className="text-[17px] font-bold">{project.name}</span>
              </div>
              <span
                className={
                  project.badgeFilled
                    ? "rounded-full bg-ink px-2 py-[2px] font-mono text-[10.5px] text-bg"
                    : "rounded-full border border-hairline bg-subtle px-2 py-[2px] font-mono text-[10.5px] text-body"
                }
              >
                {project.badge}
              </span>
            </div>
            <div className="text-[14px] leading-[1.6] text-body">
              {t(`${project.key}Desc`)}
            </div>
            <div className="mt-[2px] flex flex-wrap gap-[6px]">
              {project.stack.map((tech) => (
                <span
                  key={tech}
                  className="rounded-[4px] border border-hairline px-[7px] py-[2px] font-mono text-[11px] text-muted"
                >
                  {tech}
                </span>
              ))}
            </div>
            <div className="mt-auto flex gap-[14px] pt-2 text-[13px] font-semibold">
              {project.caseStudy && (
                <Link
                  href={project.caseStudy}
                  className="inline-flex items-center gap-[5px] hover:underline"
                >
                  {t("caseStudy")}
                  <ArrowRightIcon size={12} />
                </Link>
              )}
              {project.github && (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-muted hover:text-ink"
                >
                  GitHub ↗
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
