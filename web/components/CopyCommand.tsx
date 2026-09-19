"use client";

import { useState } from "react";

export default function CopyCommand({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {} // clipboard blocked: the command is still visible to select by hand
  }

  return (
    <div className="pg-px flex w-full max-w-md items-center justify-between gap-4 px-5 py-3 [--bd:#2f4a40] [--fill:#12221c]">
      <code className="text-base text-[#f8fafc] sm:text-lg">
        <span className="text-[#10b981]">$ </span>{command}
      </code>
      <button onClick={copy} className="font-pixel shrink-0 text-xs text-[#eab308] hover:underline">
        {copied ? "COPIED" : "COPY"}
      </button>
    </div>
  );
}
