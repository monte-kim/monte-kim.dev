import Link from "next/link";

const TABS = [
  { key: "posts", label: "Posts", href: "/admin/posts" },
  { key: "comments", label: "Comments", href: "/admin/comments" },
  { key: "messages", label: "Messages", href: "/admin/messages" },
] as const;

export type AdminTab = (typeof TABS)[number]["key"];

export function AdminNav({ active }: { active: AdminTab }) {
  return (
    <nav className="mb-6 flex gap-5 border-b border-hairline pb-3 text-[13.5px]">
      {TABS.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          className={
            tab.key === active
              ? "font-semibold text-ink"
              : "text-muted hover:text-ink"
          }
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
