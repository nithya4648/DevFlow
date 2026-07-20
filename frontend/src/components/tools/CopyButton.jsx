// src/components/tools/CopyButton.jsx
// Reusable copy-to-clipboard button used across all tools
import useCopyToClipboard from "../../hooks/useCopyToClipboard";
import { FaCopy, FaCheck } from "react-icons/fa";

export default function CopyButton({ text, className = "", label = "" }) {
  const [copied, copy] = useCopyToClipboard();

  return (
    <button
      onClick={() => copy(text)}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all duration-200 ${
        copied
          ? "bg-green-500/10 text-green-500"
          : "bg-gray-100 text-gray-500 hover:bg-indigo-500/10 hover:text-indigo-500 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-indigo-500/20 dark:hover:text-indigo-400"
      } ${className}`}
    >
      {copied ? <FaCheck className="h-3 w-3" /> : <FaCopy className="h-3 w-3" />}
      {label || (copied ? "Copied!" : "Copy")}
    </button>
  );
}
