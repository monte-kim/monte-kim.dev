"use client";

import { useState } from "react";

/** Dark code block with filename header and copy action (design 2f). */
export function CodeBlock({
  code,
  filename,
  language,
}: {
  code: string;
  filename?: string | null;
  language?: string | null;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // clipboard unavailable — ignore
    }
  };

  return (
    <div className="mb-4 overflow-hidden rounded-[9px] bg-[#1F1F1E] px-4 py-[14px] md:mb-5 md:rounded-[10px] md:px-5 md:py-[18px]">
      <div className="mb-3 flex justify-between font-mono text-[11px] text-[#8F8E88]">
        <span>{filename ?? language ?? ""}</span>
        <button
          type="button"
          onClick={copy}
          className="cursor-pointer hover:text-[#EDECE8]"
        >
          {copied ? "copied ✓" : "copy"}
        </button>
      </div>
      <pre className="m-0 overflow-x-auto font-mono text-[11.5px] leading-[1.65] text-[#EDECE8] md:text-[13px] md:leading-[1.7]">
        {code}
      </pre>
    </div>
  );
}
