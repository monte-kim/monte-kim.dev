import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAdminPost } from "@/lib/admin-posts";
import { isSupabaseConfigured } from "@/lib/supabase-server";
import { EditorShell } from "./editor-shell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Editor — admin",
};

export default async function EditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getAdminPost(id);
  if (!post) notFound();

  return <EditorShell post={post} configured={isSupabaseConfigured()} />;
}
