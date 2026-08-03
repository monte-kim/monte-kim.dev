import { cache } from "react";
import { getSupabase } from "./supabase";

export type PostPreview = {
  slug: string;
  titleEn: string;
  titleKo: string | null;
  publishedAt: string; // ISO date
  readMinutes: number;
  views: number;
};

/** Sample content matching the design canvas — used until Supabase is connected. */
const FALLBACK_POSTS: PostPreview[] = [
  {
    slug: "analytics-480x-faster-pre-aggregation",
    titleEn: "Making analytics 480× faster with a pre-aggregated data model",
    titleKo: null,
    publishedAt: "2026-07-12",
    readMinutes: 8,
    views: 1284,
  },
  {
    slug: "cutting-aws-bill-58-percent",
    titleEn: "Cutting our AWS bill 58% without touching reliability",
    titleKo: null,
    publishedAt: "2026-06-28",
    readMinutes: 11,
    views: 2031,
  },
  {
    slug: "viewport-search-postgis-pagination",
    titleEn: "Viewport search with PostGIS: bounding boxes and pagination that lies",
    titleKo: null,
    publishedAt: "2026-06-09",
    readMinutes: 13,
    views: 876,
  },
];

export async function getRecentPosts(limit = 3): Promise<PostPreview[]> {
  const supabase = getSupabase();
  if (!supabase) return FALLBACK_POSTS.slice(0, limit);

  try {
    const { data, error } = await supabase
      .from("posts")
      .select("slug,title_en,title_ko,published_at,read_minutes,post_views(count)")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(limit);

    if (error || !data || data.length === 0) {
      return FALLBACK_POSTS.slice(0, limit);
    }

    return data.map((row) => ({
      slug: row.slug,
      titleEn: row.title_en,
      titleKo: row.title_ko,
      publishedAt: row.published_at ?? "",
      readMinutes: row.read_minutes ?? 0,
      views: Array.isArray(row.post_views)
        ? Number(row.post_views[0]?.count ?? 0)
        : Number((row.post_views as { count?: number } | null)?.count ?? 0),
    }));
  } catch {
    return FALLBACK_POSTS.slice(0, limit);
  }
}

export type PostListItem = PostPreview & {
  excerptEn: string | null;
  excerptKo: string | null;
  tags: string[];
  commentCount: number;
};

/** Sample list content matching design screen 2e — used until Supabase is connected. */
const FALLBACK_LIST: PostListItem[] = [
  {
    ...FALLBACK_POSTS[0],
    excerptEn:
      "Per-request aggregation was fine at launch and fatal a year later. How I introduced a pre-aggregated model with zero downtime.",
    excerptKo: null,
    tags: ["PostgreSQL"],
    commentCount: 9,
  },
  {
    ...FALLBACK_POSTS[1],
    excerptEn:
      "A line-by-line teardown of a $493 bill, and the Terraform changes plus cost alerts that took it to $209.",
    excerptKo: null,
    tags: ["AWS"],
    commentCount: 17,
  },
  {
    ...FALLBACK_POSTS[2],
    titleEn:
      "Viewport search with PostGIS: bounding boxes, 13 filters, and pagination that lies",
    excerptEn:
      "EPSG:5179 → WGS84 transforms, QueryDSL dynamic filters, and why offset pagination breaks over one-to-many joins.",
    excerptKo: null,
    tags: ["PostgreSQL"],
    commentCount: 5,
  },
  {
    slug: "zero-downtime-deploys-oidc-flyway",
    titleEn:
      "Zero-downtime deploys: OIDC, circuit breakers, and Flyway expand-contract",
    titleKo: null,
    publishedAt: "2026-05-21",
    readMinutes: 9,
    views: 1442,
    excerptEn:
      "Keyless GitHub Actions deploys to ECS that roll themselves back when things go wrong.",
    excerptKo: null,
    tags: ["DevOps"],
    commentCount: 11,
  },
  {
    slug: "founding-muroom-mvp-5-months",
    titleEn: "Founding Muroom: shipping an MVP in 5 months with a team of six",
    titleKo: null,
    publishedAt: "2026-05-02",
    readMinutes: 6,
    views: 664,
    excerptEn:
      "What I'd repeat and what I'd never do again — from a university-backed startup build.",
    excerptKo: null,
    tags: ["Retrospective"],
    commentCount: 8,
  },
];

export async function getWritingIndex(): Promise<PostListItem[]> {
  const supabase = getSupabase();
  if (!supabase) return FALLBACK_LIST;

  try {
    const { data, error } = await supabase
      .from("posts")
      .select(
        "slug,title_en,title_ko,excerpt_en,excerpt_ko,published_at,read_minutes,post_views(count),post_tags(tags(name)),comments(count)"
      )
      .eq("status", "published")
      .order("published_at", { ascending: false });

    if (error || !data || data.length === 0) return FALLBACK_LIST;

    return data.map((row) => ({
      slug: row.slug,
      titleEn: row.title_en,
      titleKo: row.title_ko,
      publishedAt: row.published_at ?? "",
      readMinutes: row.read_minutes ?? 0,
      views: Array.isArray(row.post_views)
        ? Number(row.post_views[0]?.count ?? 0)
        : Number((row.post_views as { count?: number } | null)?.count ?? 0),
      excerptEn: row.excerpt_en,
      excerptKo: row.excerpt_ko,
      tags: (row.post_tags ?? [])
        .map((pt: { tags: { name: string } | { name: string }[] | null }) =>
          Array.isArray(pt.tags) ? pt.tags[0]?.name : pt.tags?.name
        )
        .filter((name: string | undefined): name is string => Boolean(name)),
      commentCount: Array.isArray(row.comments)
        ? Number(row.comments[0]?.count ?? 0)
        : 0,
    }));
  } catch {
    return FALLBACK_LIST;
  }
}

/* ── Post detail ─────────────────────────────────────────────────── */

/** Tiptap-compatible inline node (subset used by the renderer). */
export type InlineNode = {
  type: "text" | "hardBreak";
  text?: string;
  marks?: {
    type: "bold" | "italic" | "underline" | "code" | "link";
    attrs?: { href?: string };
  }[];
};

/** Tiptap-compatible block node (subset used by the renderer). */
export type ContentNode = {
  type:
    | "paragraph"
    | "heading"
    | "codeBlock"
    | "blockquote"
    | "bulletList"
    | "orderedList"
    | "listItem"
    | "image"
    | "horizontalRule"
    | "figurePlaceholder"
    | "table"
    | "tableRow"
    | "tableHeader"
    | "tableCell";
  attrs?: {
    level?: number;
    language?: string | null;
    filename?: string | null;
    src?: string;
    alt?: string;
    label?: string;
    colspan?: number;
    rowspan?: number;
  };
  content?: (ContentNode | InlineNode)[];
};

export type PostDoc = { type: "doc"; content: ContentNode[] };

export type PostDetail = PostListItem & {
  content: PostDoc;
  coverUrl: string | null;
};

export type CommentItem = {
  id: string;
  parentId: string | null;
  authorName: string;
  body: string;
  isAuthor: boolean;
  createdAt: string; // ISO
};

const p = (text: string): ContentNode => ({
  type: "paragraph",
  content: [{ type: "text", text }],
});
const h2 = (text: string): ContentNode => ({
  type: "heading",
  attrs: { level: 2 },
  content: [{ type: "text", text }],
});

/** Sample article matching design screen 2f — used until Supabase is connected. */
const FALLBACK_CONTENT: Record<string, PostDoc> = {
  "analytics-480x-faster-pre-aggregation": {
    type: "doc",
    content: [
      p(
        "Our analytics endpoints computed everything at request time. At launch, with a few thousand rows, that was invisible. Eighteen months in, a single trainer dashboard was scanning 40M workout records per page load — and p95 latency crossed four seconds."
      ),
      h2("The shape of the problem"),
      p(
        "Aggregating on read means cost grows with history. Aggregating on write means cost stays proportional to new data. The fix is conceptually simple — the hard part is migrating a live system to it."
      ),
      {
        type: "codeBlock",
        attrs: { language: "sql", filename: "migration.sql" },
        content: [
          {
            type: "text",
            text: "CREATE TABLE workout_daily_agg (\n  member_id   BIGINT      NOT NULL,\n  bucket_date DATE        NOT NULL,\n  total_reps  INT         NOT NULL DEFAULT 0,\n  PRIMARY KEY (member_id, bucket_date)\n);",
          },
        ],
      },
      {
        type: "blockquote",
        content: [
          p(
            "Expand first, migrate readers one by one, contract last. Never make the database do two jobs in one deploy."
          ),
        ],
      },
      { type: "figurePlaceholder", attrs: { label: "before/after latency chart" } },
      h2("Designing the aggregate table"),
      p(
        "The bucket is one member-day. Every metric the dashboard shows — reps, sets, volume, session count — becomes a column that is incremented inside the same transaction that writes the raw workout row. Reads collapse from a 40M-row scan to an index range over at most 365 rows per member."
      ),
      h2("Migrating without downtime"),
      p(
        "We backfilled the aggregate table in date-ranged batches behind a feature flag, dual-wrote for a week while comparing results in CI, then flipped read endpoints over one by one. The raw table stayed untouched until every consumer was migrated."
      ),
      h2("Results"),
      p(
        "p95 for the trainer dashboard went from 4.1s to 8.5ms — roughly 480× — and the database CPU graph finally stopped tracking marketing campaigns. The aggregate table costs us about 90MB a year, which is the cheapest performance budget I have ever spent."
      ),
    ],
  },
};

/** Detail pages show the full tag set (design 2f); the list shows fewer (2e). */
const FALLBACK_DETAIL_TAGS: Record<string, string[]> = {
  "analytics-480x-faster-pre-aggregation": ["PostgreSQL", "Performance"],
};

/** Generic fallback body for sample posts without authored content. */
function fallbackDocFor(item: PostListItem): PostDoc {
  return {
    type: "doc",
    content: [
      p(item.excerptEn ?? ""),
      h2("Context"),
      p(
        "Full write-up coming soon — this sample post exists so the layout can be built and verified before the CMS is connected."
      ),
    ],
  };
}

/** Sample comments matching design screen 2f (analytics post only). */
const FALLBACK_COMMENTS: Record<string, CommentItem[]> = {
  "analytics-480x-faster-pre-aggregation": [
    {
      id: "c1",
      parentId: null,
      authorName: "James P.",
      body: "Did you consider TimescaleDB continuous aggregates before rolling your own table?",
      isAuthor: false,
      createdAt: "2026-07-26T09:00:00Z",
    },
    {
      id: "c2",
      parentId: "c1",
      authorName: "Tae Hwan",
      body: "Yes — we actually use TimescaleDB elsewhere. Here the bucket logic needed business rules that CAGGs couldn't express cleanly.",
      isAuthor: true,
      createdAt: "2026-07-27T09:00:00Z",
    },
  ],
};

// cache(): generateMetadata and the page both call this per request
export const getPostDetail = cache(async function getPostDetail(
  slug: string
): Promise<PostDetail | null> {
  const fallback = (): PostDetail | null => {
    const item = FALLBACK_LIST.find((post) => post.slug === slug);
    if (!item) return null;
    return {
      ...item,
      tags: FALLBACK_DETAIL_TAGS[slug] ?? item.tags,
      content: FALLBACK_CONTENT[slug] ?? fallbackDocFor(item),
      coverUrl: null,
    };
  };

  const supabase = getSupabase();
  if (!supabase) return fallback();

  try {
    const { data, error } = await supabase
      .from("posts")
      .select(
        "slug,title_en,title_ko,excerpt_en,excerpt_ko,content,cover_url,published_at,read_minutes,post_views(count),post_tags(tags(name)),comments(count)"
      )
      .eq("status", "published")
      .eq("slug", slug)
      .maybeSingle();

    if (error || !data) return fallback();

    return {
      slug: data.slug,
      titleEn: data.title_en,
      titleKo: data.title_ko,
      publishedAt: data.published_at ?? "",
      readMinutes: data.read_minutes ?? 0,
      views: Array.isArray(data.post_views)
        ? Number(data.post_views[0]?.count ?? 0)
        : Number((data.post_views as { count?: number } | null)?.count ?? 0),
      excerptEn: data.excerpt_en,
      excerptKo: data.excerpt_ko,
      tags: (data.post_tags ?? [])
        .map((pt: { tags: { name: string } | { name: string }[] | null }) =>
          Array.isArray(pt.tags) ? pt.tags[0]?.name : pt.tags?.name
        )
        .filter((name: string | undefined): name is string => Boolean(name)),
      commentCount: Array.isArray(data.comments)
        ? Number(data.comments[0]?.count ?? 0)
        : 0,
      content: (data.content as PostDoc) ?? { type: "doc", content: [] },
      coverUrl: data.cover_url ?? null,
    };
  } catch {
    return fallback();
  }
});

export async function getComments(slug: string): Promise<CommentItem[]> {
  const supabase = getSupabase();
  if (!supabase) return FALLBACK_COMMENTS[slug] ?? [];

  try {
    const { data, error } = await supabase
      .from("comments")
      .select("id,parent_id,author_name,body,is_author,created_at,posts!inner(slug)")
      .eq("posts.slug", slug)
      .order("created_at", { ascending: true });

    if (error || !data) return FALLBACK_COMMENTS[slug] ?? [];

    return data.map((row) => ({
      id: row.id,
      parentId: row.parent_id,
      authorName: row.author_name,
      body: row.body,
      isAuthor: row.is_author,
      createdAt: row.created_at,
    }));
  } catch {
    return FALLBACK_COMMENTS[slug] ?? [];
  }
}

export function postTitle(post: PostPreview, locale: string): string {
  return locale === "ko" && post.titleKo ? post.titleKo : post.titleEn;
}

export function postExcerpt(post: PostListItem, locale: string): string {
  return (
    (locale === "ko" && post.excerptKo ? post.excerptKo : post.excerptEn) ?? ""
  );
}

export function formatPostDateLong(iso: string, locale: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(locale === "ko" ? "ko" : "en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatPostDate(iso: string, locale: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(locale === "ko" ? "ko" : "en-GB", {
    day: "2-digit",
    month: "short",
  }).format(date);
}
