"use client";

import { Extension, ReactRenderer, type Editor, type Range } from "@tiptap/react";
import Suggestion, { type SuggestionProps } from "@tiptap/suggestion";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
  type ReactNode,
} from "react";
import { BulletListIcon, ImageIcon, TableIcon } from "@/components/icons";

export type SlashItem = {
  title: string;
  description: string;
  hint?: string;
  icon: ReactNode;
  command: (editor: Editor, range: Range) => void;
};

export function slashItems(onImageRequest: () => void): SlashItem[] {
  return [
    {
      title: "Heading 2",
      description: "Section heading",
      hint: "##",
      icon: <span className="text-[13px] font-bold">H2</span>,
      command: (editor, range) =>
        editor.chain().focus().deleteRange(range).setNode("heading", { level: 2 }).run(),
    },
    {
      title: "Heading 3",
      description: "Subsection heading",
      hint: "###",
      icon: <span className="text-[12px] font-bold">H3</span>,
      command: (editor, range) =>
        editor.chain().focus().deleteRange(range).setNode("heading", { level: 3 }).run(),
    },
    {
      title: "Bullet list",
      description: "Simple list",
      hint: "-",
      icon: <BulletListIcon size={14} />,
      command: (editor, range) =>
        editor.chain().focus().deleteRange(range).toggleBulletList().run(),
    },
    {
      title: "Numbered list",
      description: "Ordered list",
      hint: "1.",
      icon: <span className="font-mono text-[11px] font-semibold">1.</span>,
      command: (editor, range) =>
        editor.chain().focus().deleteRange(range).toggleOrderedList().run(),
    },
    {
      title: "Code block",
      description: "Syntax-highlighted code",
      hint: "```",
      icon: <span className="font-mono text-[11px] font-semibold">{"</>"}</span>,
      command: (editor, range) =>
        editor.chain().focus().deleteRange(range).toggleCodeBlock().run(),
    },
    {
      title: "Image",
      description: "Upload to Supabase Storage",
      icon: <ImageIcon size={14} />,
      command: (editor, range) => {
        editor.chain().focus().deleteRange(range).run();
        onImageRequest();
      },
    },
    {
      title: "Quote",
      description: "Pull quote",
      hint: ">",
      icon: <span className="font-serif text-[15px] font-bold">&ldquo;</span>,
      command: (editor, range) =>
        editor.chain().focus().deleteRange(range).toggleBlockquote().run(),
    },
    {
      title: "Table",
      description: "3×3 with header row",
      icon: <TableIcon size={14} />,
      command: (editor, range) =>
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
          .run(),
    },
    {
      title: "Divider",
      description: "Horizontal rule",
      hint: "---",
      icon: <span className="text-[13px]">—</span>,
      command: (editor, range) =>
        editor.chain().focus().deleteRange(range).setHorizontalRule().run(),
    },
  ];
}

type MenuProps = { items: SlashItem[]; command: (item: SlashItem) => void };
type MenuHandle = { onKeyDown: (event: KeyboardEvent) => boolean };

const SlashMenuView = forwardRef<MenuHandle, MenuProps>(function SlashMenuView(
  { items, command },
  ref
) {
  const [selected, setSelected] = useState(0);
  useEffect(() => setSelected(0), [items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: (event) => {
      if (event.key === "ArrowDown") {
        setSelected((s) => (s + 1) % items.length);
        return true;
      }
      if (event.key === "ArrowUp") {
        setSelected((s) => (s - 1 + items.length) % items.length);
        return true;
      }
      if (event.key === "Enter") {
        if (items[selected]) command(items[selected]);
        return true;
      }
      return false;
    },
  }));

  if (items.length === 0) return null;

  return (
    <div className="w-[320px] overflow-hidden rounded-[10px] border border-border bg-surface shadow-menu">
      <div className="px-[14px] pb-[6px] pt-[10px] font-mono text-[10.5px] tracking-[0.08em] text-placeholder">
        BASIC BLOCKS
      </div>
      {items.map((item, i) => (
        <button
          key={item.title}
          type="button"
          onMouseEnter={() => setSelected(i)}
          onClick={() => command(item)}
          className={`flex w-full items-center gap-3 px-[14px] py-2 text-left ${
            i === selected ? "bg-subtle" : ""
          } ${i === items.length - 1 ? "pb-3" : ""}`}
        >
          <span className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-[6px] border border-hairline bg-surface">
            {item.icon}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[13.5px] font-semibold">{item.title}</span>
            <span className="block text-[12px] text-placeholder">
              {item.description}
            </span>
          </span>
          {item.hint && (
            <span className="font-mono text-[11px] text-placeholder">{item.hint}</span>
          )}
        </button>
      ))}
    </div>
  );
});

/** Slash-menu extension: type "/" at the start of a line to insert blocks. */
export function SlashCommand(onImageRequest: () => void) {
  return Extension.create({
    name: "slashCommand",
    addProseMirrorPlugins() {
      return [
        Suggestion({
          editor: this.editor,
          char: "/",
          startOfLine: true,
          command: ({ editor, range, props }) => {
            (props as SlashItem).command(editor as Editor, range);
          },
          items: ({ query }) =>
            slashItems(onImageRequest).filter((item) =>
              item.title.toLowerCase().includes(query.toLowerCase())
            ),
          render: () => {
            let component: ReactRenderer<MenuHandle, MenuProps> | null = null;

            const place = (clientRect?: (() => DOMRect | null) | null) => {
              const rect = clientRect?.();
              if (!rect || !component) return;
              const el = component.element as HTMLElement;
              el.style.position = "fixed";
              el.style.zIndex = "50";
              el.style.left = `${rect.left}px`;
              const below = rect.bottom + 6;
              const height = el.offsetHeight || 320;
              el.style.top =
                below + height > window.innerHeight
                  ? `${rect.top - height - 6}px`
                  : `${below}px`;
            };

            return {
              onStart: (props: SuggestionProps<SlashItem>) => {
                component = new ReactRenderer(SlashMenuView, {
                  props: {
                    items: props.items,
                    command: (item: SlashItem) => props.command(item),
                  },
                  editor: props.editor,
                });
                document.body.appendChild(component.element);
                place(props.clientRect);
              },
              onUpdate: (props: SuggestionProps<SlashItem>) => {
                component?.updateProps({
                  items: props.items,
                  command: (item: SlashItem) => props.command(item),
                });
                place(props.clientRect);
              },
              onKeyDown: ({ event }) => {
                if (event.key === "Escape") {
                  component?.destroy();
                  component?.element.remove();
                  component = null;
                  return true;
                }
                return component?.ref?.onKeyDown(event) ?? false;
              },
              onExit: () => {
                component?.destroy();
                component?.element.remove();
                component = null;
              },
            };
          },
        }),
      ];
    },
  });
}
