// src/layouts/ToolLayout.jsx
// Wraps each individual tool page with a back button and breadcrumb
import { Outlet, useLocation, Link } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { useEffect } from "react";
import { analyticsService } from "../services/analytics.service";

const TOOL_NAMES = {
  "json-formatter": "JSON Formatter & Validator",
  "jwt-decoder": "JWT Decoder",
  "jwt-generator": "JWT Generator",
  "base64": "Base64 Encode / Decode",
  "uuid-generator": "UUID Generator",
  "timestamp": "Timestamp Converter",
  "hash-generator": "Hash Generator",
  "regex-playground": "Regex Playground",
  "color-palette": "Color Palette Generator",
  "url-encoder": "URL Encoder / Decode",
  "text-diff": "Text Diff Viewer",
};

export default function ToolLayout() {
  const location = useLocation();
  const slug = location.pathname.split("/tools/")[1];
  const toolName = TOOL_NAMES[slug] || "Tool";

  useEffect(() => {
    if (slug) {
      analyticsService.logToolUsage(slug).catch(err => console.error("Failed to log tool usage:", err));
    }
  }, [slug]);

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3">
        <Link
          to="/tools"
          className="inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white transition"
        >
          <FaArrowLeft className="h-3 w-3" />
          Dev Tools
        </Link>
        <span className="text-gray-300 dark:text-gray-700">/</span>
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{toolName}</span>
      </div>

      <Outlet />
    </div>
  );
}
