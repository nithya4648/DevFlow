// src/pages/tools/ToolsIndex.jsx
// Landing page: grid of all tools with search/filter
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { FaSearch } from "react-icons/fa";

const ALL_TOOLS = [
  {
    slug: "json-formatter",
    name: "JSON Formatter",
    description: "Format, minify, and validate JSON with syntax highlighting and error lines.",
    icon: "{ }",
    tag: "format",
  },
  {
    slug: "jwt-decoder",
    name: "JWT Decoder",
    description: "Decode and inspect JWT tokens — header, payload, and signature.",
    icon: "🔓",
    tag: "auth",
  },
  {
    slug: "jwt-generator",
    name: "JWT Generator",
    description: "Sign a JWT with a custom payload and secret key.",
    icon: "🔐",
    tag: "auth",
  },
  {
    slug: "base64",
    name: "Base64 Encode / Decode",
    description: "Encode or decode any text to/from Base64.",
    icon: "📦",
    tag: "encode",
  },
  {
    slug: "uuid-generator",
    name: "UUID Generator",
    description: "Generate one or multiple v4 UUIDs with instant copy.",
    icon: "🪪",
    tag: "generate",
  },
  {
    slug: "timestamp",
    name: "Timestamp Converter",
    description: "Convert Unix timestamps to human-readable dates and vice versa, with timezone support.",
    icon: "⏱",
    tag: "convert",
  },
  {
    slug: "hash-generator",
    name: "Hash Generator",
    description: "Generate MD5, SHA-1, and SHA-256 hashes from any input string.",
    icon: "#",
    tag: "security",
  },
  {
    slug: "regex-playground",
    name: "Regex Playground",
    description: "Test regular expressions against strings with live match highlighting.",
    icon: ".*",
    tag: "debug",
  },
  {
    slug: "color-palette",
    name: "Color Palette Generator",
    description: "Pick a base color and generate a full harmonious color palette with hex codes.",
    icon: "🎨",
    tag: "design",
  },
  {
    slug: "url-encoder",
    name: "URL Encoder / Decode",
    description: "Encode or decode URL components and query strings.",
    icon: "🔗",
    tag: "encode",
  },
  {
    slug: "text-diff",
    name: "Text Diff Viewer",
    description: "Paste two blocks of text and see line-by-line differences highlighted.",
    icon: "⇄",
    tag: "compare",
  },
];

const TAGS = ["all", ...new Set(ALL_TOOLS.map((t) => t.tag))];

export default function ToolsIndex() {
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("all");

  const filtered = useMemo(() => {
    return ALL_TOOLS.filter((tool) => {
      const matchesSearch =
        tool.name.toLowerCase().includes(search.toLowerCase()) ||
        tool.description.toLowerCase().includes(search.toLowerCase());
      const matchesTag = activeTag === "all" || tool.tag === activeTag;
      return matchesSearch && matchesTag;
    });
  }, [search, activeTag]);

  return (
    <div className="space-y-6 font-ui">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-gh-heading font-mono flex items-center gap-2">
          Dev Tools
          <span className="text-xs font-normal text-gh-muted">
            ({ALL_TOOLS.length} tools)
          </span>
        </h1>
        <p className="text-xs text-gh-muted font-mono">
          Client-side utilities — everything runs in your browser, nothing leaves your machine.
        </p>
      </div>

      {/* Search + Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gh-muted" />
          <input
            type="text"
            placeholder="Search tools…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="gh-input pl-9 text-xs font-mono w-full"
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`rounded-md px-3 py-1.5 text-xs font-mono capitalize transition-colors ${
                activeTag === tag
                  ? "bg-accent-light text-accent-fg border border-accent-border font-semibold"
                  : "btn-secondary"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Tools Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center gh-card">
          <p className="text-3xl">🔍</p>
          <p className="mt-2 text-xs font-mono text-gh-muted">No tools match your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
          {filtered.map((tool) => (
            <Link
              key={tool.slug}
              to={`/tools/${tool.slug}`}
              className="group flex flex-col gh-card p-4 hover:border-accent-border transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-base font-mono bg-gh-subtle border border-gh-border text-gh-heading">
                  {tool.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-mono font-semibold text-gh-heading group-hover:text-accent-fg transition-colors">
                    {tool.name}
                  </p>
                  <p className="mt-1 text-xs text-gh-muted leading-relaxed line-clamp-2">
                    {tool.description}
                  </p>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-gh-border flex items-center justify-between">
                <span className="gh-badge text-[9px] font-mono uppercase tracking-wider">
                  {tool.tag}
                </span>
                <span className="text-xs font-mono font-medium text-gh-muted group-hover:text-accent-fg transition-colors">
                  Open →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
