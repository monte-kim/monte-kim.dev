import { notFound } from "next/navigation";
import { getPostDetail } from "@/lib/posts";

/**
 * Existence check for unknown slugs. NOTE: because an ancestor loading.tsx
 * streams the shell first, the HTTP status is still 200 — Next injects
 * <meta name="robots" content="noindex"> into the streamed 404 UI, which is
 * what keeps crawlers from indexing it. If the loading boundaries are ever
 * removed this check restores a real 404 status. getPostDetail is
 * request-cached, so metadata/page reuse this fetch.
 */
export default async function PostLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostDetail(slug);
  if (!post) notFound();
  return children;
}
