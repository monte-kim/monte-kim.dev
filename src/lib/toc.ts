import type { ContentNode, InlineNode, PostDoc } from "./posts";

export type TocItem = { id: string; text: string; level: number };

export function nodeText(node: ContentNode | InlineNode): string {
  if ("text" in node && typeof node.text === "string") return node.text;
  if ("content" in node) return (node.content ?? []).map(nodeText).join("");
  return "";
}

export function headingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function extractToc(doc: PostDoc): TocItem[] {
  return doc.content
    .filter((node) => node.type === "heading")
    .map((node) => {
      const text = nodeText(node);
      return { id: headingId(text), text, level: node.attrs?.level ?? 2 };
    });
}
