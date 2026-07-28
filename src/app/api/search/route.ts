import { NextResponse } from "next/server";
import { getWritingIndex } from "@/lib/posts";

export const revalidate = 60;

/** Post index for the ⌘K search modal (small payload, filtered client-side). */
export async function GET() {
  const posts = await getWritingIndex();
  return NextResponse.json(
    posts.map((post) => ({
      slug: post.slug,
      titleEn: post.titleEn,
      titleKo: post.titleKo,
      excerptEn: post.excerptEn,
      excerptKo: post.excerptKo,
      tags: post.tags,
      publishedAt: post.publishedAt,
    }))
  );
}
