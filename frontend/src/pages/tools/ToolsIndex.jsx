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
    color: "from-yellow-500 to-orange-500",
    bg: "bg-yellow-500/10 dark:bg-yellow-500/5",
  },
  {
    slug: "jwt-decoder",
    name: "JWT Decoder",
    description: "Decode and inspect JWT tokens — header, payload, and signature.",
    icon: "🔓",
    tag: "auth",
    color: "from-blue-500 to-indigo-500",
    bg: "bg-blue-500/10 dark:bg-blue-500/5",
  },
  {
    slug: "jwt-generator",
    name: "JWT Generator",
    description: "Sign a JWT with a custom payload and secret key.",
    icon: "🔐",
    tag: "auth",
    color: "from-indigo-500 to-purple-500",
    bg: "bg-indigo-500/10 dark:bg-indigo-500/5",
  },
  {
    slug: "base64",
    name: "Base64 Encode / Decode",
    description: "Encode or decode any text to/from Base64.",
    icon: "📦",
    tag: "encode",
    color: "from-teal-500 to-cyan-500",
    bg: "bg-teal-500/10 dark:bg-teal-500/5",
  },
  {
    slug: "uuid-generator",
    name: "UUID Generator",
    description: "Generate one or multiple v4 UUIDs with instant copy.",
    icon: "🪪",
    tag: "generate",
    color: "from-violet-500 to-purple-500",
    bg: "bg-violet-500/10 dark:bg-violet-500/5",
  },
  {
    slug: "timestamp",
    name: "Timestamp Converter",
    description: "Convert Unix timestamps to human-readable dates and vice versa, with timezone support.",
    icon: "⏱",
    tag: "convert",
    color: "from-green-500 to-emerald-500",
    bg: "bg-green-500/10 dark:bg-green-500/5",
  },
  {
    slug: "hash-generator",
    name: "Hash Generator",
    description: "Generate MD5, SHA-1, and SHA-256 hashes from any input string.",
    icon: "#",
    tag: "security",
    color: "from-red-500 to-rose-500",
    bg: "bg-red-500/10 dark:bg-red-500/5",
  },
  {
    slug: "regex-playground",
    name: "Regex Playground",
    description: "Test regular expressions against strings with live match highlighting.",
    icon: ".*",
    tag: "debug",
    color: "from-orange-500 to-amber-500",
    bg: "bg-orange-500/10 dark:bg-orange-500/5",
  },
  {
    slug: "color-palette",
    name: "Color Palette Generator",
    description: "Pick a base color and generate a full harmonious color palette with hex codes.",
    icon: "🎨",
    tag: "design",
    color: "from-pink-500 to-fuchsia-500",
    bg: "bg-pink-500/10 dark:bg-pink-500/5",
  },
  {
    slug: "url-encoder",
    name: "URL Encoder / Decode",
    description: "Encode or decode URL components and query strings.",
    icon: "🔗",
    tag: "encode",
    color: "from-sky-500 to-blue-500",
    bg: "bg-sky-500/10 dark:bg-sky-500/5",
  },
  {
    slug: "text-diff",
    name: "Text Diff Viewer",
    description: "Paste two blocks of text and see line-by-line differences highlighted.",
    icon: "⇄",
    tag: "compare",
    color: "from-slate-500 to-gray-500",
    bg: "bg-slate-500/10 dark:bg-slate-500/5",
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
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">
          Dev Tools
          <span className="ml-2 text-sm font-semibold text-gray-400 dark:text-gray-500">
            {ALL_TOOLS.length} tools
          </span>
        </h1>
        <p className="text-sm text-gray-400 dark:text-gray-500">
          Client-side utilities — everything runs in your browser, nothing leaves your machine.
        </p>
      </div>

      {/* Search + Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search tools…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-600 transition"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`rounded-xl px-3.5 py-2 text-xs font-bold capitalize transition ${
                activeTag === tag
                  ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Tools Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-4xl">🔍</p>
          <p className="mt-3 text-sm font-semibold text-gray-400">No tools match your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((tool) => (
            <Link
              key={tool.slug}
              to={`/tools/${tool.slug}`}
              className="group relative rounded-2xl border border-gray-150 bg-white p-5 hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/5 dark:border-gray-800 dark:bg-gray-900/40 dark:hover:border-indigo-500/30 transition-all duration-200"
            >
              {/* Gradient glow on hover */}
              <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br ${tool.color} blur-2xl -z-10`} />

              <div className="flex items-start gap-4">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl font-black ${tool.bg}`}>
                  <span className={`bg-gradient-to-br ${tool.color} bg-clip-text text-transparent`}>
                    {tool.icon}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-indigo-500 transition">
                    {tool.name}
                  </p>
                  <p className="mt-1 text-xs text-gray-400 dark:text-gray-500 leading-relaxed line-clamp-2">
                    {tool.description}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:bg-gray-800 dark:text-gray-500">
                  {tool.tag}
                </span>
                <span className="text-xs font-bold text-gray-300 group-hover:text-indigo-400 transition dark:text-gray-700">
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
