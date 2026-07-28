import type { ReactNode } from "react";
import type { ContentNode, InlineNode, PostDoc } from "@/lib/posts";
import { headingId, nodeText } from "@/lib/toc";
import { CodeBlock } from "./code-block";

/**
 * Renders post content (Tiptap-compatible JSON) with the prose styles of
 * design screen 2f — shared by the public post page and the editor preview.
 */

const PARAGRAPH_CLASS =
  "mb-4 text-[15px] leading-[1.7] text-[#33322F] dark:text-body md:mb-5 md:text-[16px] md:leading-[1.75]";

function renderInline(nodes: (ContentNode | InlineNode)[] | undefined): ReactNode {
  if (!nodes) return null;
  return nodes.map((node, i) => {
    if (node.type === "hardBreak") return <br key={i} />;
    if (!("text" in node) || typeof node.text !== "string") return null;

    let el: ReactNode = node.text;
    for (const mark of (node as InlineNode).marks ?? []) {
      if (mark.type === "bold") {
        el = <strong className="font-semibold text-ink">{el}</strong>;
      } else if (mark.type === "italic") {
        el = <em>{el}</em>;
      } else if (mark.type === "underline") {
        el = <u>{el}</u>;
      } else if (mark.type === "code") {
        el = (
          <code className="rounded-[4px] bg-subtle px-[5px] py-[1px] font-mono text-[0.85em]">
            {el}
          </code>
        );
      } else if (mark.type === "link") {
        el = (
          <a
            href={mark.attrs?.href}
            className="underline underline-offset-2"
            target="_blank"
            rel="noreferrer noopener"
          >
            {el}
          </a>
        );
      }
    }
    return <span key={i}>{el}</span>;
  });
}

function renderNode(node: ContentNode, key: number): ReactNode {
  switch (node.type) {
    case "paragraph":
      return (
        <p key={key} className={PARAGRAPH_CLASS}>
          {renderInline(node.content)}
        </p>
      );

    case "heading": {
      const text = nodeText(node);
      const id = headingId(text);
      if ((node.attrs?.level ?? 2) >= 3) {
        return (
          <h3
            key={key}
            id={id}
            className="mb-3 mt-7 scroll-mt-20 text-[17px] font-bold tracking-[-0.2px] md:text-[18px]"
          >
            {renderInline(node.content)}
          </h3>
        );
      }
      return (
        <h2
          key={key}
          id={id}
          className="mb-[14px] mt-9 scroll-mt-20 text-[20px] font-bold tracking-[-0.4px] md:text-[22px]"
        >
          {renderInline(node.content)}
        </h2>
      );
    }

    case "codeBlock":
      return (
        <CodeBlock
          key={key}
          code={nodeText(node)}
          filename={node.attrs?.filename}
          language={node.attrs?.language}
        />
      );

    case "blockquote":
      return (
        <blockquote
          key={key}
          className="mb-4 border-l-2 border-ink py-1 pl-5 text-[15px] italic leading-[1.7] text-body md:mb-5 md:text-[16px]"
        >
          {(node.content ?? []).map((child, i) => (
            <span key={i} className="block">
              {renderInline((child as ContentNode).content)}
            </span>
          ))}
        </blockquote>
      );

    case "bulletList":
    case "orderedList": {
      const List = node.type === "bulletList" ? "ul" : "ol";
      return (
        <List
          key={key}
          className={`mb-4 flex list-outside flex-col gap-[6px] pl-5 md:mb-5 ${
            node.type === "bulletList" ? "list-disc" : "list-decimal"
          }`}
        >
          {(node.content ?? []).map((item, i) => (
            <li
              key={i}
              className="text-[15px] leading-[1.7] text-[#33322F] dark:text-body md:text-[16px] md:leading-[1.75]"
            >
              {((item as ContentNode).content ?? []).map((child, j) =>
                (child as ContentNode).type === "paragraph" ? (
                  <span key={j}>{renderInline((child as ContentNode).content)}</span>
                ) : (
                  renderNode(child as ContentNode, j)
                )
              )}
            </li>
          ))}
        </List>
      );
    }

    case "image":
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={key}
          src={node.attrs?.src}
          alt={node.attrs?.alt ?? ""}
          className="mb-4 max-w-full rounded-[10px] border border-border md:mb-5"
        />
      );

    case "horizontalRule":
      return <hr key={key} className="my-8 border-hairline" />;

    case "figurePlaceholder":
      return (
        <div
          key={key}
          className="mb-4 flex h-[220px] items-center justify-center rounded-[10px] border border-border bg-[repeating-linear-gradient(45deg,var(--subtle),var(--subtle)_10px,var(--bg)_10px,var(--bg)_20px)] md:mb-5"
        >
          <span className="rounded-[5px] border border-border bg-bg px-[10px] py-1 font-mono text-[12px] text-muted">
            {node.attrs?.label}
          </span>
        </div>
      );

    default:
      return null;
  }
}

export function PostContent({ doc }: { doc: PostDoc }) {
  return <div>{doc.content.map((node, i) => renderNode(node, i))}</div>;
}
