import type { PostDoc } from "./posts";
import { getWritingIndex, getPostDetail } from "./posts";
import { getSupabaseServer, isSupabaseConfigured } from "./supabase-server";

export type AdminComment = {
  id: string;
  authorName: string;
  isAuthor: boolean;
  body: string;
  createdAt: string;
  postTitle: string;
  postSlug: string;
  isReply: boolean;
};

export type AdminMessage = {
  id: string;
  name: string;
  email: string;
  body: string;
  createdAt: string;
};

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

/** Preview-mode sample rows so the moderation UI can be built/checked without env. */
const FALLBACK_ADMIN_COMMENTS: AdminComment[] = [
  {
    id: "c1",
    authorName: "James P.",
    isAuthor: false,
    body: "Did you consider TimescaleDB continuous aggregates before rolling your own table?",
    createdAt: "2026-07-26T09:00:00Z",
    postTitle: "Making analytics 480× faster with a pre-aggregated data model",
    postSlug: "analytics-480x-faster-pre-aggregation",
    isReply: false,
  },
  {
    id: "c2",
    authorName: "Tae Hwan",
    isAuthor: true,
    body: "Yes — we actually use TimescaleDB elsewhere. Here the bucket logic needed business rules that CAGGs couldn't express cleanly.",
    createdAt: "2026-07-27T09:00:00Z",
    postTitle: "Making analytics 480× faster with a pre-aggregated data model",
    postSlug: "analytics-480x-faster-pre-aggregation",
    isReply: true,
  },
];

const FALLBACK_ADMIN_MESSAGES: AdminMessage[] = [
  {
    id: "m1",
    name: "Jane Recruiter",
    email: "jane@company.co.uk",
    body: "We're looking for a backend engineer who has shipped production analytics at scale — your 480× write-up caught our eye. Are you open to a chat next week?",
    createdAt: "2026-07-28T14:30:00Z",
  },
];

export async function getAdminComments(): Promise<AdminComment[]> {
  if (!isSupabaseConfigured()) return FALLBACK_ADMIN_COMMENTS;

  const supabase = await getSupabaseServer();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("comments")
    .select("id,author_name,is_author,body,created_at,parent_id,posts(title_en,slug)")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error || !data) return [];
  return data.map((row) => {
    const post = Array.isArray(row.posts) ? row.posts[0] : row.posts;
    return {
      id: row.id,
      authorName: row.author_name,
      isAuthor: row.is_author,
      body: row.body,
      createdAt: row.created_at,
      postTitle: post?.title_en || "Untitled",
      postSlug: post?.slug ?? "",
      isReply: Boolean(row.parent_id),
    };
  });
}

export async function getAdminMessages(): Promise<AdminMessage[]> {
  if (!isSupabaseConfigured()) return FALLBACK_ADMIN_MESSAGES;

  const supabase = await getSupabaseServer();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("messages")
    .select("id,name,email,body,created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error || !data) return [];
  return data.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    body: row.body,
    createdAt: row.created_at,
  }));
}
