import type { Metadata } from "next";
import Link from "next/link";
import { deleteComment } from "@/app/actions/admin";
import { getAdminComments } from "@/lib/admin-posts";
import { isSupabaseConfigured } from "@/lib/supabase-server";
import { AdminNav } from "../admin-nav";
import { DeleteButton } from "../delete-button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Comments — admin",
};

export default async function AdminCommentsPage() {
  const [comments, configured] = [await getAdminComments(), isSupabaseConfigured()];

  return (
    <div className="mx-auto max-w-[720px] px-6 pb-16 pt-10 md:px-10">
      <div className="mb-5 flex items-center gap-3">
        <h1 className="text-[24px] font-bold tracking-[-0.6px]">Comments</h1>
        {!configured && (
          <span className="rounded-full border border-hairline bg-subtle px-2 py-[2px] font-mono text-[11px] text-muted">
            preview — Supabase not connected
          </span>
        )}
      </div>
      <AdminNav active="comments" />

      <div className="flex flex-col">
        {comments.map((comment, i) => (
          <div
            key={comment.id}
            className={`flex items-start justify-between gap-4 py-4 ${
              i < comments.length - 1 ? "border-b border-hairline" : ""
            }`}
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-[13.5px] font-semibold">
                  {comment.authorName}
                </span>
                {comment.isAuthor && (
                  <span className="rounded-[3px] bg-hairline px-[6px] py-[1px] font-mono text-[10px] text-body">
                    author
                  </span>
                )}
                {comment.isReply && (
                  <span className="font-mono text-[11px] text-placeholder">
                    reply
                  </span>
                )}
                <span className="font-mono text-[12px] text-placeholder">
                  {comment.createdAt.slice(0, 10)}
                </span>
              </div>
              <div className="mt-[3px] text-[14px] leading-[1.6] text-body">
                {comment.body}
              </div>
              <Link
                href={`/writing/${comment.postSlug}`}
                className="mt-[5px] inline-block text-[12px] font-semibold text-muted hover:text-ink"
              >
                on “{comment.postTitle}” →
              </Link>
            </div>
            <div className="flex-none pt-[2px]">
              <DeleteButton
                action={deleteComment.bind(null, comment.id)}
                confirmText={`Delete this comment by ${comment.authorName}? Replies to it are deleted too.`}
                disabled={!configured}
              />
            </div>
          </div>
        ))}
        {comments.length === 0 && (
          <div className="py-10 text-center text-[14px] text-muted">
            No comments yet.
          </div>
        )}
      </div>
    </div>
  );
}
