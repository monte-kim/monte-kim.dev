"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Image from "@tiptap/extension-image";
import { TableKit } from "@tiptap/extension-table";
import { Placeholder } from "@tiptap/extensions";
import { DragHandle } from "@tiptap/extension-drag-handle-react";
import { common, createLowlight } from "lowlight";
import {
  publishPost,
  savePost,
  unpublishPost,
  uploadImage,
} from "@/app/actions/admin";
import {
  ArrowLeftIcon,
  ArrowUpRightIcon,
  BulletListIcon,
  CheckIcon,
  ChevronDownIcon,
  EyeIcon,
  GripIcon,
  ImageIcon,
  LinkIcon,
  PlusIcon,
  RefreshIcon,
  Spinner,
  TrashIcon,
} from "@/components/icons";
import { PostContent } from "@/components/post/post-content";
import { showToast } from "@/components/toast";
import type { AdminPost } from "@/lib/admin-posts";
import { compressCover, compressImage } from "@/lib/compress-image";
import type { PostDoc } from "@/lib/posts";
import { nodeText } from "@/lib/toc";
import { SlashCommand } from "./slash-command";

const lowlight = createLowlight(common);

/** Nodes the public fallback uses that aren't in the Tiptap schema. */
function sanitizeDoc(doc: PostDoc): PostDoc {
  return {
    ...doc,
    content: doc.content.filter((node) => node.type !== "figurePlaceholder"),
  };
}

const EMPTY_DOC: PostDoc = { type: "doc", content: [] };

function isEmptyDoc(doc: PostDoc | null): boolean {
  return !doc || !doc.content.some((n) => nodeText(n).trim() || n.type === "image");
}

function formatBytes(n: number): string {
  return n >= 1024 * 1024
    ? `${(n / 1024 / 1024).toFixed(1)}MB`
    : `${Math.round(n / 1024)}KB`;
}

function savedLabel(lastSaved: Date | null, now: number): string {
  if (!lastSaved) return "";
  const seconds = Math.max(0, Math.round((now - lastSaved.getTime()) / 1000));
  if (seconds < 5) return "Saved just now";
  if (seconds < 60) return `Saved ${seconds}s ago`;
  return `Saved ${Math.round(seconds / 60)}m ago`;
}

export function EditorShell({
  post,
  configured,
}: {
  post: AdminPost;
  configured: boolean;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(post.titleEn);
  const [titleKo, setTitleKo] = useState(post.titleKo ?? "");
  const [tags, setTags] = useState<string[]>(post.tags);
  const [tagInput, setTagInput] = useState<string | null>(null);
  const [status, setStatus] = useState(post.status);
  const [mode, setMode] = useState<"write" | "preview">("write");
  const [previewLang, setPreviewLang] = useState<"en" | "ko">("en");
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [previewDocs, setPreviewDocs] = useState<{ en: PostDoc; ko: PostDoc | null }>({
    en: sanitizeDoc(post.content),
    ko: post.contentKo ? sanitizeDoc(post.contentKo) : null,
  });

  // bilingual body: one editor instance, docs swapped per language tab
  const [lang, setLang] = useState<"en" | "ko">("en");
  const langRef = useRef<"en" | "ko">("en");
  const docsRef = useRef<{ en: PostDoc; ko: PostDoc | null }>({
    en: sanitizeDoc(post.content),
    ko: post.contentKo ? sanitizeDoc(post.contentKo) : null,
  });

  // cover (design 2i): idle → compressing → uploading → idle
  const [coverUrl, setCoverUrl] = useState(post.coverUrl);
  const [coverPhase, setCoverPhase] = useState<"idle" | "compressing" | "uploading">("idle");
  const [coverBytes, setCoverBytes] = useState<{ orig: number; out: number | null }>({ orig: 0, out: null });
  const [coverActions, setCoverActions] = useState(false); // mobile: tap reveals
  const coverCancelRef = useRef(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stateRef = useRef({ title, titleKo, tags, coverUrl });
  stateRef.current = { title, titleKo, tags, coverUrl };

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        link: {
          openOnClick: false,
          // Tiptap's default URI validation rejects relative paths and strips
          // their href on load — internal /writing/... links must survive
          isAllowedUri: (url, ctx) =>
            url.startsWith("/") || url.startsWith("#") || ctx.defaultValidate(url),
        },
        // the post title is the page's only h1 — body headings start at h2
        heading: { levels: [2, 3] },
      }),
      CodeBlockLowlight.configure({ lowlight }),
      Image,
      TableKit.configure({ table: { resizable: false } }),
      Placeholder.configure({ placeholder: "Write, or type “/” for blocks…" }),
      SlashCommand(() => fileInputRef.current?.click()),
    ],
    editorProps: { attributes: { class: "editor-prose" } },
    content: sanitizeDoc(post.content),
    onUpdate: ({ editor: e }) => {
      docsRef.current[langRef.current] = e.getJSON() as PostDoc;
      scheduleSave();
    },
  });

  // ticking "Saved 12s ago"
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(t);
  }, []);

  const saveFailedRef = useRef(false);

  const doSave = useCallback(
    async (editorInstance: Editor | null) => {
      if (!configured || !editorInstance) return;
      setSaving(true);
      docsRef.current[langRef.current] = editorInstance.getJSON() as PostDoc;
      const koDoc = isEmptyDoc(docsRef.current.ko) ? null : docsRef.current.ko;
      const result = await savePost(post.id, {
        titleEn: stateRef.current.title,
        titleKo: stateRef.current.titleKo.trim() || null,
        content: docsRef.current.en,
        contentKo: koDoc,
        tags: stateRef.current.tags,
        coverUrl: stateRef.current.coverUrl,
      });
      setSaving(false);
      if (result.ok) {
        setLastSaved(new Date());
        saveFailedRef.current = false;
      } else if (!saveFailedRef.current) {
        // toast once per failure streak — autosave retries every pause
        saveFailedRef.current = true;
        showToast("Save failed — changes are not persisted", "error");
      }
    },
    [configured, post.id]
  );

  const scheduleSave = useCallback(() => {
    if (!configured) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => doSave(editorRef.current), 2000);
  }, [configured, doSave]);

  // keep a ref so scheduleSave (created before editor) can reach it
  const editorRef = useRef<Editor | null>(null);
  editorRef.current = editor;

  const changeTitle = (value: string) => {
    if (lang === "ko") setTitleKo(value);
    else setTitle(value);
    scheduleSave();
  };

  const switchLang = (next: "en" | "ko") => {
    if (!editor || next === lang) return;
    // flush BEFORE moving langRef, and move langRef BEFORE setContent —
    // setContent can emit an update, and onUpdate writes into docsRef[langRef]
    docsRef.current[langRef.current] = editor.getJSON() as PostDoc;
    langRef.current = next;
    if (next === "ko" && !docsRef.current.ko) docsRef.current.ko = EMPTY_DOC;
    editor.commands.setContent(docsRef.current[next] ?? EMPTY_DOC, {
      emitUpdate: false,
    });
    setLang(next);
  };

  const addTag = (name: string) => {
    const trimmed = name.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      scheduleSave();
    }
    setTagInput(null);
  };

  const removeTag = (name: string) => {
    setTags(tags.filter((t) => t !== name));
    scheduleSave();
  };

  const togglePublish = async () => {
    if (!configured || publishing) return;
    setPublishing(true);
    try {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      await doSave(editor);
      const wasPublished = status === "published";
      const result = wasPublished
        ? await unpublishPost(post.id)
        : await publishPost(post.id);
      if (result.ok) {
        setStatus(wasPublished ? "draft" : "published");
        if (wasPublished) {
          showToast("Moved back to draft");
        } else {
          // show the reader-facing result right away
          openPreview();
          showToast("Published — now live");
        }
        router.refresh();
      } else {
        showToast(
          wasPublished ? "Unpublish failed" : "Publish failed",
          "error"
        );
      }
    } finally {
      setPublishing(false);
    }
  };

  const pickCover = async (file: File) => {
    if (!configured) return;
    coverCancelRef.current = false;
    setCoverPhase("compressing");
    setCoverBytes({ orig: file.size, out: null });
    try {
      const { file: compressed } = await compressCover(file);
      if (coverCancelRef.current) return;
      setCoverBytes({ orig: file.size, out: compressed.size });
      setCoverPhase("uploading");
      const formData = new FormData();
      formData.append("file", compressed);
      const result = await uploadImage(post.id, formData);
      if (coverCancelRef.current) return;
      if ("url" in result) {
        setCoverUrl(result.url);
        scheduleSave();
      }
    } catch {
      // compression/upload failed — stay coverless
    } finally {
      if (!coverCancelRef.current) setCoverPhase("idle");
    }
  };

  const cancelCover = () => {
    coverCancelRef.current = true;
    setCoverPhase("idle");
  };

  const removeCover = () => {
    setCoverUrl(null);
    setCoverActions(false);
    scheduleSave();
  };

  const pickImage = async (file: File) => {
    if (!configured || !editor) return;
    try {
      const compressed = await compressImage(file);
      const formData = new FormData();
      formData.append("file", compressed);
      const result = await uploadImage(post.id, formData);
      if ("url" in result) {
        editor.chain().focus().setImage({ src: result.url }).run();
      }
    } catch {
      // compression/upload failed — leave the document untouched
    }
  };

  const openPreview = () => {
    if (editor) {
      docsRef.current[langRef.current] = editor.getJSON() as PostDoc;
      setPreviewDocs({
        en: docsRef.current.en,
        ko: isEmptyDoc(docsRef.current.ko) ? null : docsRef.current.ko,
      });
    }
    setPreviewLang(lang === "ko" && !isEmptyDoc(docsRef.current.ko) ? "ko" : "en");
    setMode("preview");
  };

  const setBlockType = (type: "paragraph" | "h2" | "h3" | "quote") => {
    if (!editor) return;
    const chain = editor.chain().focus();
    if (type === "paragraph") chain.setParagraph().run();
    else if (type === "h2") chain.setNode("heading", { level: 2 }).run();
    else if (type === "h3") chain.setNode("heading", { level: 3 }).run();
    else chain.toggleBlockquote().run();
  };

  const currentBlockLabel = !editor
    ? "Text"
    : editor.isActive("heading", { level: 2 })
      ? "H2"
      : editor.isActive("heading", { level: 3 })
        ? "H3"
        : editor.isActive("blockquote")
          ? "Quote"
          : "Text";

  const [turnIntoOpen, setTurnIntoOpen] = useState(false);

  // v3 doesn't re-render on every transaction — track table state explicitly
  const inTable = useEditorState({
    editor,
    selector: (ctx) => ctx.editor?.isActive("table") ?? false,
  });

  const setLink = () => {
    if (!editor) return;
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previous ?? "https://");
    if (url === null) return;
    if (url === "") editor.chain().focus().unsetLink().run();
    else editor.chain().focus().setLink({ href: url }).run();
  };

  const bubbleButton =
    "flex h-[26px] w-[28px] items-center justify-center rounded-[5px] text-[13px] text-bg";

  return (
    <div className="min-h-dvh pb-24 md:pb-16">
      {/* top bar */}
      <div className="sticky top-0 z-40 flex h-[52px] items-center justify-between border-b border-hairline bg-surface px-4 md:px-6">
        <div className="flex min-w-0 items-center gap-[10px] text-[13px] text-muted md:gap-[14px]">
          <Link href="/admin/posts" aria-label="Back to posts">
            <ArrowLeftIcon size={14} />
          </Link>
          <Link href="/admin/posts" className="hidden font-medium text-ink md:block">
            Posts
          </Link>
          <span className="hidden text-border md:block">/</span>
          <span className="hidden max-w-[260px] truncate md:block">
            {title || "Untitled"}
          </span>
          <span className="rounded-full border border-hairline bg-subtle px-2 py-[2px] font-mono text-[10.5px] md:text-[11px]">
            {status === "published" ? "Published" : "Draft"}
          </span>
          <span className="text-[11px] text-placeholder md:hidden">
            {configured ? (saving ? "Saving…" : lastSaved ? "Saved ✓" : "") : "preview"}
          </span>
        </div>
        <div className="flex items-center gap-[10px] md:gap-[14px]">
          <span className="hidden items-center gap-[5px] text-[12px] text-placeholder md:inline-flex">
            {configured ? (
              saving ? (
                <>
                  <Spinner size={12} />
                  Saving…
                </>
              ) : lastSaved ? (
                <>
                  <CheckIcon size={12} />
                  {savedLabel(lastSaved, now)}
                </>
              ) : (
                "Not saved yet"
              )
            ) : (
              "preview mode — saves disabled"
            )}
          </span>
          {/* Write/Preview segmented toggle */}
          <div className="hidden overflow-hidden rounded-[7px] border border-border text-[12.5px] font-semibold md:flex">
            <button
              type="button"
              onClick={() => setMode("write")}
              className={`inline-flex items-center gap-[6px] px-3 py-[5px] ${
                mode === "write" ? "bg-ink text-bg" : "text-muted"
              }`}
            >
              <ArrowUpRightIcon size={12} />
              Write
            </button>
            <button
              type="button"
              onClick={openPreview}
              className={`inline-flex items-center gap-[6px] px-3 py-[5px] ${
                mode === "preview" ? "bg-ink text-bg" : "text-muted"
              }`}
            >
              <EyeIcon size={12} strokeLinejoin="miter" />
              Preview
            </button>
          </div>
          <button
            type="button"
            aria-label="Preview"
            onClick={() => (mode === "write" ? openPreview() : setMode("write"))}
            className="text-muted md:hidden"
          >
            <EyeIcon size={16} strokeLinejoin="miter" />
          </button>
          <button
            type="button"
            onClick={togglePublish}
            disabled={!configured || publishing}
            className="inline-flex items-center gap-[6px] rounded-[7px] bg-ink px-[13px] py-[6px] text-[12px] font-semibold text-bg disabled:opacity-50 md:px-4 md:text-[12.5px]"
          >
            {publishing && <Spinner size={12} />}
            {status === "published" ? "Unpublish" : "Publish"}
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void pickImage(file);
          e.target.value = "";
        }}
      />
      <input
        ref={coverInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void pickCover(file);
          e.target.value = "";
        }}
      />

      {mode === "preview" ? (
        <article className="mx-auto max-w-[720px] px-6 pb-16 pt-8 md:px-10 md:pt-14">
          {/* preview language */}
          <div className="mb-5 flex overflow-hidden self-start rounded-[6px] border border-border text-[12px] font-semibold" style={{ width: "fit-content" }}>
            {(["en", "ko"] as const).map((l) => (
              <button
                key={l}
                type="button"
                disabled={l === "ko" && !previewDocs.ko}
                onClick={() => setPreviewLang(l)}
                className={`px-[9px] py-1 uppercase ${
                  previewLang === l ? "bg-ink text-bg" : "text-muted"
                } disabled:opacity-40`}
              >
                {l}
              </button>
            ))}
          </div>
          <h1 className="mb-4 text-pretty text-[24px] font-bold leading-[1.2] tracking-[-0.6px] md:text-[34px] md:leading-[1.15] md:tracking-[-1px]">
            {previewLang === "ko" ? titleKo || title || "Untitled" : title || "Untitled"}
          </h1>
          {coverUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverUrl}
              alt=""
              className="mb-5 aspect-[1200/630] w-full rounded-[9px] border border-hairline object-cover md:mb-8 md:rounded-[10px]"
            />
          )}
          <PostContent
            doc={previewLang === "ko" && previewDocs.ko ? previewDocs.ko : previewDocs.en}
          />
        </article>
      ) : (
        <div className="mx-auto max-w-[720px] px-6 pb-[72px] pt-7 md:px-10 md:pt-14">
          {/* body language tab — EN is canonical; KO left empty falls back to EN on the site */}
          <div className="mb-4 flex items-center gap-3">
            <div className="flex overflow-hidden rounded-[6px] border border-border text-[12px] font-semibold">
              {(["en", "ko"] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => switchLang(l)}
                  className={`px-[9px] py-1 uppercase ${
                    lang === l ? "bg-ink text-bg" : "text-muted"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
            <span className="font-mono text-[11px] text-placeholder">
              {lang === "ko"
                ? "한국어 본문 — 비워두면 사이트에서 EN으로 표시"
                : "English body (canonical)"}
            </span>
          </div>

          {/* tag + cover chips */}
          <div className="mb-5 flex flex-wrap items-center gap-[10px]">
            {tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => removeTag(tag)}
                title="Remove tag"
                className="inline-flex items-center gap-[5px] rounded-[4px] border border-hairline px-2 py-[3px] font-mono text-[11px] text-muted hover:border-border"
              >
                {tag}
                <span className="text-placeholder">×</span>
              </button>
            ))}
            {tagInput !== null ? (
              <input
                autoFocus
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onBlur={() => addTag(tagInput)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addTag(tagInput);
                  if (e.key === "Escape") setTagInput(null);
                }}
                className="w-[100px] rounded-[4px] border border-dashed border-border bg-transparent px-2 py-[3px] font-mono text-[11px] text-ink outline-none"
              />
            ) : (
              <button
                type="button"
                onClick={() => setTagInput("")}
                className="inline-flex items-center gap-[5px] rounded-[4px] border border-dashed border-border px-2 py-[3px] font-mono text-[11px] text-muted hover:text-ink"
              >
                <PlusIcon size={11} />
                Add tag
              </button>
            )}
            {!coverUrl && coverPhase === "idle" && (
              <button
                type="button"
                disabled={!configured}
                onClick={() => coverInputRef.current?.click()}
                className="inline-flex items-center gap-[5px] rounded-[4px] border border-dashed border-border px-2 py-[3px] font-mono text-[11px] text-muted hover:text-ink disabled:opacity-60"
              >
                <ImageIcon size={11} />
                Add cover
              </button>
            )}
          </div>

          {/* cover zone (design 2i) — appears at final 1.91:1 size, no layout shift */}
          {coverPhase !== "idle" && (
            <div className="mb-[14px] flex aspect-[1200/630] flex-col items-center justify-center gap-[10px] rounded-[9px] border border-hairline bg-subtle md:gap-3 md:rounded-[10px]">
              <div className="h-1 w-[55%] overflow-hidden rounded-full bg-hairline md:w-[60%]">
                <div
                  className={`h-full rounded-full bg-ink transition-all duration-500 ${
                    coverPhase === "compressing" ? "w-2/5" : "w-4/5"
                  }`}
                />
              </div>
              <div className="font-mono text-[10.5px] text-muted md:text-[11px]">
                {coverPhase === "compressing"
                  ? `Compressing… ${formatBytes(coverBytes.orig)}`
                  : `Uploading… ${formatBytes(coverBytes.orig)} → ${formatBytes(coverBytes.out ?? 0)}`}
              </div>
              <button
                type="button"
                onClick={cancelCover}
                className="rounded-[6px] border border-border px-3 py-1 text-[12px] font-semibold text-muted hover:text-ink"
              >
                Cancel
              </button>
            </div>
          )}
          {coverUrl && coverPhase === "idle" && (
            <div
              className="group relative mb-[14px] overflow-hidden rounded-[9px] border border-hairline md:rounded-[10px]"
              onClick={() => setCoverActions((v) => !v)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={coverUrl}
                alt="Post cover"
                className="aspect-[1200/630] w-full object-cover"
              />
              <div
                className={`absolute right-[10px] top-[10px] flex gap-[6px] transition-opacity group-hover:opacity-100 ${
                  coverActions ? "opacity-100" : "opacity-0"
                }`}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    coverInputRef.current?.click();
                  }}
                  className="inline-flex items-center gap-[5px] rounded-[6px] bg-[rgba(26,26,24,0.85)] px-3 py-[5px] text-[12px] font-semibold text-[#FBFBFA]"
                >
                  <RefreshIcon size={11} />
                  Replace
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeCover();
                  }}
                  className="inline-flex items-center gap-[5px] rounded-[6px] bg-[rgba(26,26,24,0.85)] px-3 py-[5px] text-[12px] font-semibold text-[#FBFBFA]"
                >
                  <TrashIcon size={11} />
                  Remove
                </button>
              </div>
              <span
                className={`absolute bottom-[10px] left-[10px] rounded-[4px] border border-border bg-bg px-2 py-[2px] font-mono text-[10.5px] text-muted transition-opacity group-hover:opacity-100 ${
                  coverActions ? "opacity-100" : "opacity-0"
                }`}
              >
                1200×630 · center crop
              </span>
            </div>
          )}

          {/* title — bound to the active language */}
          <textarea
            key={lang}
            value={lang === "ko" ? titleKo : title}
            onChange={(e) => {
              changeTitle(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
            placeholder={lang === "ko" ? "제목 (한국어)" : "Post title"}
            rows={2}
            className="mb-5 w-full resize-none overflow-hidden bg-transparent text-[26px] font-bold leading-[1.2] tracking-[-0.8px] text-ink outline-none placeholder:text-placeholder md:mb-7 md:text-[38px] md:tracking-[-1.2px]"
          />

          {/* editor with drag handle */}
          {editor && (
            <DragHandle editor={editor}>
              <div className="mr-[6px] flex gap-[2px] pt-[5px] text-[#C9C8C2] dark:text-[#4a4a47]">
                <button
                  type="button"
                  aria-label="Add block"
                  onClick={() =>
                    editor.chain().focus().createParagraphNear().insertContent("/").run()
                  }
                >
                  <PlusIcon size={14} />
                </button>
                <span className="cursor-grab">
                  <GripIcon size={14} />
                </span>
              </div>
            </DragHandle>
          )}
          <EditorContent editor={editor} />

          {/* floating selection toolbar */}
          {editor && (
            <BubbleMenu
              editor={editor}
              className="z-50"
              shouldShow={({ state }) =>
                !state.selection.empty && !editor.isActive("codeBlock")
              }
            >
              <div className="relative inline-flex items-center gap-[2px] rounded-[8px] bg-[#1A1A18] p-1 shadow-[0_4px_14px_rgba(26,26,24,0.25)]">
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  className={`${bubbleButton} font-bold ${
                    editor.isActive("bold") ? "bg-[#33322F]" : ""
                  } text-[#FBFBFA]`}
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  className={`${bubbleButton} font-serif italic ${
                    editor.isActive("italic") ? "bg-[#33322F]" : ""
                  } text-[#FBFBFA]`}
                >
                  i
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleUnderline().run()}
                  className={`${bubbleButton} underline ${
                    editor.isActive("underline") ? "bg-[#33322F]" : ""
                  } text-[#FBFBFA]`}
                >
                  U
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleCode().run()}
                  className={`${bubbleButton} font-mono text-[12px] ${
                    editor.isActive("code") ? "bg-[#33322F]" : ""
                  } text-[#FBFBFA]`}
                >
                  {"</>"}
                </button>
                <span className="mx-[3px] h-4 w-px bg-[#4A4945]" />
                <button
                  type="button"
                  aria-label="Link"
                  onClick={setLink}
                  className="mx-[7px] text-[#FBFBFA]"
                >
                  <LinkIcon size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setTurnIntoOpen((v) => !v)}
                  className="flex items-center gap-1 px-2 text-[12px] text-[#FBFBFA]"
                >
                  {currentBlockLabel}
                  <ChevronDownIcon size={10} />
                </button>
                {turnIntoOpen && (
                  <div className="absolute right-0 top-[34px] w-[120px] overflow-hidden rounded-[8px] border border-border bg-surface py-1 shadow-menu">
                    {(
                      [
                        ["Text", "paragraph"],
                        ["Heading 2", "h2"],
                        ["Heading 3", "h3"],
                        ["Quote", "quote"],
                      ] as const
                    ).map(([label, type]) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          setBlockType(type);
                          setTurnIntoOpen(false);
                        }}
                        className="block w-full px-3 py-[6px] text-left text-[12.5px] text-ink hover:bg-subtle"
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </BubbleMenu>
          )}
        </div>
      )}

      {/* table controls — visible while the cursor is inside a table */}
      {editor && mode === "write" && inTable && (
        <div className="fixed bottom-[54px] left-1/2 z-40 flex -translate-x-1/2 items-center gap-[2px] rounded-[8px] bg-[#1A1A18] p-1 shadow-[0_4px_14px_rgba(26,26,24,0.25)] md:bottom-6">
          {(
            [
              ["+ Row", () => editor.chain().focus().addRowAfter().run()],
              ["− Row", () => editor.chain().focus().deleteRow().run()],
              ["+ Col", () => editor.chain().focus().addColumnAfter().run()],
              ["− Col", () => editor.chain().focus().deleteColumn().run()],
            ] as const
          ).map(([label, run]) => (
            <button
              key={label}
              type="button"
              onClick={run}
              className="rounded-[5px] px-2 py-[5px] font-mono text-[11.5px] text-[#FBFBFA] hover:bg-[#33322F]"
            >
              {label}
            </button>
          ))}
          <span className="mx-[3px] h-4 w-px bg-[#4A4945]" />
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteTable().run()}
            className="inline-flex items-center gap-[5px] rounded-[5px] px-2 py-[5px] text-[11.5px] font-semibold text-[#FBFBFA] hover:bg-[#33322F]"
          >
            <TrashIcon size={11} />
            Table
          </button>
        </div>
      )}

      {/* mobile block toolbar (design 3c) */}
      {editor && mode === "write" && (
        <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-1 border-t border-hairline bg-surface px-3 py-2 md:hidden">
          <button
            type="button"
            aria-label="Add block"
            onClick={() =>
              editor.chain().focus().createParagraphNear().insertContent("/").run()
            }
            className="flex h-[30px] w-8 items-center justify-center rounded-[6px] bg-subtle"
          >
            <PlusIcon size={15} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`flex h-[30px] w-8 items-center justify-center rounded-[6px] text-[13px] font-bold ${
              editor.isActive("bold") ? "bg-subtle" : ""
            }`}
          >
            B
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`flex h-[30px] w-8 items-center justify-center rounded-[6px] font-serif text-[13px] italic ${
              editor.isActive("italic") ? "bg-subtle" : ""
            }`}
          >
            i
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`flex h-[30px] w-8 items-center justify-center rounded-[6px] font-mono text-[11px] ${
              editor.isActive("codeBlock") ? "bg-subtle" : ""
            }`}
          >
            {"</>"}
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`flex h-[30px] w-8 items-center justify-center rounded-[6px] text-[12px] font-bold ${
              editor.isActive("heading", { level: 2 }) ? "bg-subtle" : ""
            }`}
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`flex h-[30px] w-8 items-center justify-center rounded-[6px] ${
              editor.isActive("bulletList") ? "bg-subtle" : ""
            }`}
          >
            <BulletListIcon size={15} />
          </button>
          <button
            type="button"
            aria-label="Image"
            onClick={() => fileInputRef.current?.click()}
            className="flex h-[30px] w-8 items-center justify-center rounded-[6px]"
          >
            <ImageIcon size={15} />
          </button>
          <button
            type="button"
            aria-label="Dismiss keyboard"
            onClick={() => editor.commands.blur()}
            className="ml-auto text-placeholder"
          >
            <ChevronDownIcon size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
