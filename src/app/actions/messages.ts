"use server";

import { headers } from "next/headers";
import { isRateLimited } from "@/lib/rate-limit";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export type MessageResult =
  | { ok: true }
  | { ok: false; error: "invalid" | "rateLimited" | "unavailable" };

const MAX_NAME = 80;
const MAX_EMAIL = 200;
const MAX_BODY = 4000;

// 3 messages per IP per 10 minutes (see rate-limit.ts for caveats)
const RATE_LIMIT = 3;
const RATE_WINDOW_MS = 10 * 60 * 1000;

const NOTIFY_TO = "monte6198@gmail.com";

/** Fire-and-forget email notification — failure must not fail the form. */
async function notifyByEmail(name: string, email: string, body: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "monte-kim.dev <onboarding@resend.dev>",
        to: [NOTIFY_TO],
        reply_to: email,
        subject: `Say hi from ${name}`,
        text: `${name} <${email}>\n\n${body}`,
      }),
    });
  } catch {
    // notification is best-effort
  }
}

export async function sendMessage(formData: FormData): Promise<MessageResult> {
  // honeypot — real users never fill this hidden field
  if (formData.get("website")) return { ok: true };

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();

  if (
    !name ||
    !email ||
    !body ||
    name.length > MAX_NAME ||
    email.length > MAX_EMAIL ||
    body.length > MAX_BODY ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return { ok: false, error: "invalid" };
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) return { ok: false, error: "unavailable" };

  const headerList = await headers();
  const ip =
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(`message:${ip}`, RATE_LIMIT, RATE_WINDOW_MS)) {
    return { ok: false, error: "rateLimited" };
  }

  try {
    const { error } = await supabase
      .from("messages")
      .insert({ name, email, body });
    if (error) return { ok: false, error: "unavailable" };

    await notifyByEmail(name, email, body);
    return { ok: true };
  } catch {
    return { ok: false, error: "unavailable" };
  }
}
