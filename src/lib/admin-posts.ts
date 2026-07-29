import type { PostDoc } from "./posts";
import { getWritingIndex, getPostDetail } from "./posts";
import { getSupabaseServer, isSupabaseConfigured } from "./supabase-server";

export type AdminPostListItem = {
  id: string;
  slug: string;
  titleEn: string;
  status: "draft" | "published";
  publishedAt: string | null;
  updatedAt: string | null;
};

export type AdminPost = AdminPostListItem & {
  content: PostDoc;
  tags: string[];
  coverUrl: string | null;
};

/**
 * Admin reads use the cookie-session client (RLS: authenticated sees all
 * posts). Without Supabase env the admin runs in preview mode backed by the
 * public fallback sample posts (slug doubles as id, saves are disabled).
 */
export async function getAdminPosts(): Promise<AdminPostListItem[]> {
  if (!isSupabaseConfigured()) {
    const posts = await getWritingIndex();
    return posts.map((post) => ({
      id: post.slug,
      slug: post.slug,
      titleEn: post.titleEn,
      status: "published" as const,
      publishedAt: post.publishedAt,
      updatedAt: null,
    }));
  }

  const supabase = await getSupabaseServer();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("posts")
    .select("id,slug,title_en,status,published_at,updated_at")
    .order("updated_at", { ascending: false });

  if (error || !data) return [];
  return data.map((row) => ({
    id: row.id,
    slug: row.slug,
    titleEn: row.title_en,
    status: row.status,
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
  }));
}

export async function getAdminPost(id: string): Promise<AdminPost | null> {
  if (!isSupabaseConfigured()) {
    const post = await getPostDetail(id); // preview mode: id is the slug
    if (!post) return null;
    return {
      id: post.slug,
      slug: post.slug,
      titleEn: post.titleEn,
      status: "published",
      publishedAt: post.publishedAt,
      updatedAt: null,
      content: post.content,
      tags: post.tags,
      coverUrl: post.coverUrl,
    };
  }

  const supabase = await getSupabaseServer();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("posts")
    .select(
      "id,slug,title_en,status,published_at,updated_at,content,cover_url,post_tags(tags(name))"
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return {
    id: data.id,
    slug: data.slug,
    titleEn: data.title_en,
    status: data.status,
    publishedAt: data.published_at,
    updatedAt: data.updated_at,
    content: (data.content as PostDoc) ?? { type: "doc", content: [] },
    coverUrl: data.cover_url ?? null,
    tags: (data.post_tags ?? [])
      .map((pt: { tags: { name: string } | { name: string }[] | null }) =>
        Array.isArray(pt.tags) ? pt.tags[0]?.name : pt.tags?.name
      )
      .filter((name: string | undefined): name is string => Boolean(name)),
  };
}
