// src/components/tools/CopyButton.jsx
// Reusable copy-to-clipboard button used across all tools
import useCopyToClipboard from "../../hooks/useCopyToClipboard";
import { FaCopy, FaCheck } from "react-icons/fa";

export default function CopyButton({ text, className = "", label = "" }) {
  const [copied, copy] = useCopyToClipboard();

  return (
    <button
      onClick={() => copy(text)}
      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-mono font-semibold transition-colors ${
        copied
          ? "bg-accent-light text-accent-fg border border-accent-border"
          : "bg-gh-subtle text-gh-muted border border-gh-border hover:bg-accent-light hover:text-accent-fg hover:border-accent-border"
      } ${className}`}
    >
      {copied ? <FaCheck className="h-3 w-3" /> : <FaCopy className="h-3 w-3" />}
      {label || (copied ? "Copied!" : "Copy")}
    </button>
  );
}
