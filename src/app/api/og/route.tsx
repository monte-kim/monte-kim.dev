import { ImageResponse } from "next/og";

export const runtime = "edge";

/**
 * Dynamic OG cards (1200×630) in the site's design language.
 * `/api/og` → site default card · `/api/og?slug=x` → post card.
 * Posts with an uploaded cover use the cover instead (see generateMetadata).
 */

const INK = "#1A1A18";
const BG = "#FBFBFA";
const MUTED = "#6F6E69";
const PLACEHOLDER = "#A3A29C";
const BORDER = "#D9D8D3";
const HAIRLINE = "#ECEBE7";

type PostData = {
  title: string;
  tags: string[];
  date: string;
  readMinutes: number;
};

async function fetchPost(slug: string): Promise<PostData | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  try {
    const res = await fetch(
      `${url}/rest/v1/posts?select=title_en,read_minutes,published_at,post_tags(tags(name))&slug=eq.${encodeURIComponent(
        slug
      )}&status=eq.published`,
      { headers: { apikey: key } }
    );
    const rows = await res.json();
    const row = rows?.[0];
    if (!row) return null;
    return {
      title: row.title_en ?? "",
      tags: (row.post_tags ?? [])
        .map((pt: { tags: { name: string } | null }) => pt.tags?.name)
        .filter(Boolean)
        .slice(0, 3),
      date: row.published_at
        ? new Intl.DateTimeFormat("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }).format(new Date(row.published_at))
        : "",
      readMinutes: row.read_minutes ?? 0,
    };
  } catch {
    return null;
  }
}

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: BG,
        position: "relative",
        fontFamily: '"Instrument Sans", "Noto Sans KR"',
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 28,
          left: 28,
          right: 28,
          bottom: 28,
          border: `1px solid ${HAIRLINE}`,
          borderRadius: 24,
          display: "flex",
        }}
      />
      {children}
    </div>
  );
}

function Monogram({ size, border, radius, fontSize }: { size: number; border: number; radius: number; fontSize: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        border: `${border}px solid ${INK}`,
        borderRadius: radius,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize,
        fontWeight: 700,
        letterSpacing: -1,
        color: INK,
      }}
    >
      TK
    </div>
  );
}

function PostCard({ post }: { post: PostData }) {
  const title =
    post.title.length > 110 ? `${post.title.slice(0, 110)}…` : post.title;
  const titleSize =
    title.length <= 40 ? 64 : title.length <= 80 ? 54 : 46;

  return (
    <Frame>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          padding: "76px 84px",
        }}
      >
        {/* header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <Monogram size={54} border={3} radius={14} fontSize={24} />
            <div style={{ fontSize: 27, fontWeight: 700, color: INK }}>
              monte-kim.dev
            </div>
          </div>
          <div
            style={{
              fontFamily: '"JetBrains Mono"',
              fontSize: 20,
              color: MUTED,
              display: "flex",
            }}
          >
            {post.date}
          </div>
        </div>

        {/* title block */}
        <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
          <div
            style={{
              width: 48,
              height: 7,
              background: INK,
              borderRadius: 4,
              display: "flex",
            }}
          />
          {post.tags.length > 0 && (
            <div style={{ display: "flex", gap: 10 }}>
              {post.tags.map((tag) => (
                <div
                  key={tag}
                  style={{
                    fontFamily: '"JetBrains Mono"',
                    fontSize: 19,
                    color: MUTED,
                    border: `1.5px solid ${BORDER}`,
                    borderRadius: 8,
                    padding: "7px 16px",
                    display: "flex",
                  }}
                >
                  {tag}
                </div>
              ))}
            </div>
          )}
          <div
            style={{
              fontSize: titleSize,
              fontWeight: 700,
              letterSpacing: -2.2,
              lineHeight: 1.12,
              color: INK,
              maxWidth: 1000,
              display: "flex",
            }}
          >
            {title}
          </div>
        </div>

        {/* footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              fontFamily: '"JetBrains Mono"',
              fontSize: 20,
              color: MUTED,
              display: "flex",
            }}
          >
            {post.readMinutes > 0 ? `${post.readMinutes} min read` : "Writing"}
          </div>
          <div
            style={{
              fontFamily: '"JetBrains Mono"',
              fontSize: 20,
              color: PLACEHOLDER,
              display: "flex",
            }}
          >
            monte-kim.dev/writing
          </div>
        </div>
      </div>
    </Frame>
  );
}

function SiteCard() {
  return (
    <Frame>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          gap: 30,
          paddingBottom: 10,
        }}
      >
        <Monogram size={96} border={4} radius={22} fontSize={42} />
        <div
          style={{
            fontSize: 52,
            fontWeight: 700,
            letterSpacing: -2,
            color: INK,
            display: "flex",
          }}
        >
          monte-kim.dev
        </div>
        <div
          style={{
            fontSize: 26,
            fontWeight: 500,
            color: MUTED,
            maxWidth: 720,
            textAlign: "center",
            lineHeight: 1.5,
            display: "flex",
          }}
        >
          Production war stories: backend architecture, AWS, and the
          occasional retrospective.
        </div>
        <div
          style={{
            fontFamily: '"JetBrains Mono"',
            fontSize: 20,
            color: PLACEHOLDER,
            marginTop: 14,
            display: "flex",
          }}
        >
          by Tae Hwan “Monte” Kim
        </div>
      </div>
    </Frame>
  );
}

export async function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url);
  const slug = searchParams.get("slug");
  const post = slug ? await fetchPost(slug) : null;

  const needsKorean = Boolean(post && /[가-힣]/.test(post.title));

  const [sansBold, sansMedium, mono, koreanBold] = await Promise.all([
    fetch(`${origin}/fonts/og/instrument-sans-latin-700-normal.woff`).then(
      (r) => r.arrayBuffer()
    ),
    fetch(`${origin}/fonts/og/instrument-sans-latin-500-normal.woff`).then(
      (r) => r.arrayBuffer()
    ),
    fetch(`${origin}/fonts/og/jetbrains-mono-latin-400-normal.woff`).then((r) =>
      r.arrayBuffer()
    ),
    needsKorean
      ? fetch(`${origin}/fonts/og/noto-sans-kr-korean-700-normal.woff`).then(
          (r) => r.arrayBuffer()
        )
      : Promise.resolve(null),
  ]);

  const fonts = [
    { name: "Instrument Sans", data: sansBold, weight: 700 as const },
    { name: "Instrument Sans", data: sansMedium, weight: 500 as const },
    { name: "JetBrains Mono", data: mono, weight: 400 as const },
    ...(koreanBold
      ? [{ name: "Noto Sans KR", data: koreanBold, weight: 700 as const }]
      : []),
  ];

  return new ImageResponse(post ? <PostCard post={post} /> : <SiteCard />, {
    width: 1200,
    height: 630,
    fonts,
    headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
