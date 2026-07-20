// src/hooks/useCopyToClipboard.js
import { useState, useCallback } from "react";

/**
 * Reusable hook that copies text to the clipboard and gives short-lived feedback.
 * Usage: const [copied, copy] = useCopyToClipboard();
 *        copy("text to copy");
 */
export default function useCopyToClipboard(resetMs = 2000) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(
    async (text) => {
      if (!text) return;
      try {
        await navigator.clipboard.writeText(String(text));
        setCopied(true);
        setTimeout(() => setCopied(false), resetMs);
      } catch {
        // fallback for older browsers
        const el = document.createElement("textarea");
        el.value = String(text);
        el.style.position = "fixed";
        el.style.opacity = "0";
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
        setCopied(true);
        setTimeout(() => setCopied(false), resetMs);
      }
    },
    [resetMs]
  );

  return [copied, copy];
}
