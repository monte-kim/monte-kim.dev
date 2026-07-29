import type { Metadata } from "next";
import Link from "next/link";
import { createDraft, deletePost } from "@/app/actions/admin";
import { signOut } from "@/app/actions/auth";
import { getAdminPosts } from "@/lib/admin-posts";
import { isSupabaseConfigured } from "@/lib/supabase-server";
import { AdminNav } from "../admin-nav";
import { DeleteButton } from "../delete-button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Posts — admin",
};

function StatusPill({ status }: { status: "draft" | "published" }) {
  return (
    <span className="rounded-full border border-hairline bg-subtle px-2 py-[2px] font-mono text-[11px] text-muted">
      {status === "published" ? "Published" : "Draft"}
    </span>
  );
}

export default async function AdminPostsPage() {
  const [posts, configured] = [await getAdminPosts(), isSupabaseConfigured()];

  return (
    <div className="mx-auto max-w-[720px] px-6 pb-16 pt-10 md:px-10">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-[24px] font-bold tracking-[-0.6px]">Posts</h1>
          {!configured && (
            <span className="rounded-full border border-hairline bg-subtle px-2 py-[2px] font-mono text-[11px] text-muted">
              preview — Supabase not connected
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {configured && (
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-[7px] border border-btn2-border px-3 py-[6px] text-[12.5px] font-semibold text-body"
              >
                Sign out
              </button>
            </form>
          )}
          <form
            action={
              configured
                ? async () => {
                    "use server";
                    await createDraft();
                  }
                : undefined
            }
          >
            <button
              type="submit"
              disabled={!configured}
              className="rounded-[7px] bg-ink px-4 py-[7px] text-[12.5px] font-semibold text-bg disabled:opacity-50"
            >
              New post
            </button>
          </form>
        </div>
      </div>

      <AdminNav active="posts" />

      <div className="flex flex-col">
        {posts.map((post, i) => (
          <div
            key={post.id}
            className={`flex items-center justify-between gap-4 py-4 ${
              i < posts.length - 1 ? "border-b border-hairline" : ""
            }`}
          >
            <Link
              href={`/admin/editor/${post.id}`}
              className="group min-w-0 flex-1"
            >
              <div className="truncate text-[15.5px] font-semibold group-hover:underline">
                {post.titleEn || "Untitled"}
              </div>
              <div className="mt-[2px] font-mono text-[12px] text-placeholder">
                {post.slug}
              </div>
            </Link>
            <div className="flex flex-none items-center gap-3">
              <div className="hidden flex-col items-end font-mono text-[11px] leading-[1.5] text-placeholder md:flex">
                {post.createdAt && <span>created {post.createdAt.slice(0, 10)}</span>}
                {post.updatedAt && <span>updated {post.updatedAt.slice(0, 10)}</span>}
              </div>
              <StatusPill status={post.status} />
              <DeleteButton
                action={deletePost.bind(null, post.id)}
                confirmText={`Delete "${post.titleEn || "Untitled"}"? Comments, views and uploaded images are removed with it. This cannot be undone.`}
                disabled={!configured}
              />
            </div>
          </div>
        ))}
        {posts.length === 0 && (
          <div className="py-10 text-center text-[14px] text-muted">
            No posts yet — create one.
          </div>
        )}
      </div>
    </div>
  );
}
