"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { PostDoc } from "@/lib/posts";
import { nodeText } from "@/lib/toc";
import { getSupabaseServer } from "@/lib/supabase-server";

export type AdminActionResult =
  | { ok: true }
  | { ok: false; error: "unauthorized" | "unavailable" | "failed" };

const FAIL = { ok: false as const, error: "failed" as const };

/** All admin mutations run as the logged-in user so RLS `authenticated` policies apply. */
async function getAuthedClient() {
  const supabase = await getSupabaseServer();
  if (!supabase) return { supabase: null, error: "unavailable" as const };
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { supabase: null, error: "unauthorized" as const };
  return { supabase, error: null };
}

function slugify(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 80) || "untitled"
  );
}

function docText(doc: PostDoc): string {
  return doc.content.map(nodeText).join("\n");
}

function readMinutes(doc: PostDoc): number {
  const words = docText(doc).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function excerptOf(doc: PostDoc): string | null {
  const first = doc.content.find((node) => node.type === "paragraph");
  if (!first) return null;
  const text = nodeText(first);
  return text ? text.slice(0, 180) : null;
}

export async function createDraft(): Promise<AdminActionResult> {
  const { supabase, error } = await getAuthedClient();
  if (!supabase) return { ok: false, error };

  const { data, error: insertError } = await supabase
    .from("posts")
    .insert({
      slug: `draft-${crypto.randomUUID().slice(0, 8)}`,
      title_en: "",
      content: { type: "doc", content: [] },
    })
    .select("id")
    .single();

  if (insertError || !data) return FAIL;
  redirect(`/admin/editor/${data.id}`);
}

export async function savePost(
  id: string,
  payload: { titleEn: string; content: PostDoc; tags: string[] }
): Promise<AdminActionResult> {
  const { supabase, error } = await getAuthedClient();
  if (!supabase) return { ok: false, error };

  const { error: updateError } = await supabase
    .from("posts")
    .update({
      title_en: payload.titleEn,
      content: payload.content,
      read_minutes: readMinutes(payload.content),
      excerpt_en: excerptOf(payload.content),
    })
    .eq("id", id);
  if (updateError) return FAIL;

  // replace tag set: upsert by name, then rewrite the join rows
  const names = [...new Set(payload.tags.map((t) => t.trim()).filter(Boolean))];
  const { data: tagRows, error: tagError } = names.length
    ? await supabase.from("tags").upsert(
        names.map((name) => ({ name })),
        { onConflict: "name", ignoreDuplicates: false }
      ).select("id,name")
    : { data: [], error: null };
  if (tagError) return FAIL;

  await supabase.from("post_tags").delete().eq("post_id", id);
  if (tagRows && tagRows.length) {
    const { error: joinError } = await supabase
      .from("post_tags")
      .insert(tagRows.map((tag) => ({ post_id: id, tag_id: tag.id })));
    if (joinError) return FAIL;
  }

  return { ok: true };
}

export async function publishPost(id: string): Promise<AdminActionResult> {
  const { supabase, error } = await getAuthedClient();
  if (!supabase) return { ok: false, error };

  const { data: post } = await supabase
    .from("posts")
    .select("slug,title_en,published_at")
    .eq("id", id)
    .maybeSingle();
  if (!post) return FAIL;

  // replace the placeholder draft slug with one derived from the title
  let slug = post.slug;
  if (slug.startsWith("draft-") && post.title_en) {
    const base = slugify(post.title_en);
    slug = base;
    for (let n = 2; n < 20; n += 1) {
      const { data: clash } = await supabase
        .from("posts")
        .select("id")
        .eq("slug", slug)
        .neq("id", id)
        .maybeSingle();
      if (!clash) break;
      slug = `${base}-${n}`;
    }
  }

  const { error: updateError } = await supabase
    .from("posts")
    .update({
      status: "published",
      slug,
      published_at: post.published_at ?? new Date().toISOString(),
    })
    .eq("id", id);
  if (updateError) return FAIL;

  revalidatePath("/");
  revalidatePath("/writing");
  revalidatePath(`/writing/${slug}`);
  return { ok: true };
}

export async function unpublishPost(id: string): Promise<AdminActionResult> {
  const { supabase, error } = await getAuthedClient();
  if (!supabase) return { ok: false, error };

  const { error: updateError } = await supabase
    .from("posts")
    .update({ status: "draft" })
    .eq("id", id);
  if (updateError) return FAIL;

  revalidatePath("/");
  revalidatePath("/writing");
  return { ok: true };
}

const MAX_IMAGE_BYTES = 300 * 1024; // client compresses below this first

export async function uploadImage(
  postId: string,
  formData: FormData
): Promise<{ ok: true; url: string } | AdminActionResult> {
  const { supabase, error } = await getAuthedClient();
  if (!supabase) return { ok: false, error };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0 || file.size > MAX_IMAGE_BYTES) {
    return FAIL;
  }

  const ext = (file.name.split(".").pop() ?? "png").toLowerCase();
  const path = `${postId}/${crypto.randomUUID().slice(0, 8)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("post-images")
    .upload(path, file, { contentType: file.type });
  if (uploadError) return FAIL;

  const { data } = supabase.storage.from("post-images").getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}
