import { useTranslations } from "next-intl";

const LINKS = [
  // TODO: replace with real profile URLs
  { key: "github", href: "https://github.com/" },
  { key: "linkedin", href: "https://www.linkedin.com/" },
  { key: "email", href: "mailto:monte6198@gmail.com" },
] as const;

export function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="flex flex-col gap-2 border-t border-hairline px-5 py-5 text-[13px] text-muted sm:flex-row sm:items-center sm:justify-between md:px-10">
      <span>{t("copyright")}</span>
      <span className="flex gap-4">
        {LINKS.map(({ key, href }) => (
          <a key={key} href={href} className="hover:text-ink">
            {t(key)}
          </a>
        ))}
      </span>
    </footer>
  );
}
