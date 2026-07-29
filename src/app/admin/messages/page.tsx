import type { Metadata } from "next";
import { deleteMessage } from "@/app/actions/admin";
import { getAdminMessages } from "@/lib/admin-posts";
import { isSupabaseConfigured } from "@/lib/supabase-server";
import { AdminNav } from "../admin-nav";
import { DeleteButton } from "../delete-button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Messages — admin",
};

export default async function AdminMessagesPage() {
  const [messages, configured] = [await getAdminMessages(), isSupabaseConfigured()];

  return (
    <div className="mx-auto max-w-[720px] px-6 pb-16 pt-10 md:px-10">
      <div className="mb-5 flex items-center gap-3">
        <h1 className="text-[24px] font-bold tracking-[-0.6px]">Messages</h1>
        {!configured && (
          <span className="rounded-full border border-hairline bg-subtle px-2 py-[2px] font-mono text-[11px] text-muted">
            preview — Supabase not connected
          </span>
        )}
      </div>
      <AdminNav active="messages" />

      <div className="flex flex-col">
        {messages.map((message, i) => (
          <div
            key={message.id}
            className={`flex items-start justify-between gap-4 py-4 ${
              i < messages.length - 1 ? "border-b border-hairline" : ""
            }`}
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-[13.5px] font-semibold">{message.name}</span>
                <a
                  href={`mailto:${message.email}`}
                  className="font-mono text-[12px] text-muted hover:text-ink"
                >
                  {message.email}
                </a>
                <span className="font-mono text-[12px] text-placeholder">
                  {message.createdAt.slice(0, 16).replace("T", " ")}
                </span>
              </div>
              <div className="mt-[3px] whitespace-pre-wrap text-[14px] leading-[1.6] text-body">
                {message.body}
              </div>
            </div>
            <div className="flex flex-none items-center gap-2 pt-[2px]">
              <a
                href={`mailto:${message.email}?subject=${encodeURIComponent(
                  "Re: your message via monte-kim.dev"
                )}`}
                className="rounded-[6px] border border-btn2-border px-[10px] py-[4px] text-[12px] font-semibold text-muted hover:border-border hover:text-ink"
              >
                Reply
              </a>
              <DeleteButton
                action={deleteMessage.bind(null, message.id)}
                confirmText={`Delete this message from ${message.name}?`}
                disabled={!configured}
              />
            </div>
          </div>
        ))}
        {messages.length === 0 && (
          <div className="py-10 text-center text-[14px] text-muted">
            No messages yet.
          </div>
        )}
      </div>
    </div>
  );
}
