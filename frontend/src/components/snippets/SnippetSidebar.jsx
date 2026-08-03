// frontend/src/components/snippets/SnippetSidebar.jsx

const ALL = "__all__";
const FAV = "__favorites__";

export default function SnippetSidebar({ folders, tags, activeFilter, onFilterChange, totalCount, favCount }) {
  function isActive(type, value) {
    return activeFilter.type === type && activeFilter.value === value;
  }

  function navItem(label, icon, type, value, count) {
    const active = isActive(type, value);
    return (
      <button
        key={`${type}-${value}`}
        onClick={() => onFilterChange({ type, value })}
        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-mono transition-colors ${
          active
            ? "bg-accent-light text-accent-fg border border-accent-border font-semibold"
            : "text-gh-text hover:text-gh-heading hover:bg-gh-subtle border border-transparent"
        }`}
      >
        <span className="flex items-center gap-2 truncate">
          <span>{icon}</span>
          <span className="truncate">{label}</span>
        </span>
        {count !== undefined && (
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${active ? "bg-accent-border text-accent-fg" : "text-gh-muted"}`}>
            {count}
          </span>
        )}
      </button>
    );
  }

  return (
    <aside className="w-48 shrink-0 flex flex-col gap-1 pr-2 border-r border-gh-border font-ui">
      {/* All + Favorites */}
      <div className="mb-1">
        {navItem("All Snippets", "⚡", "all", ALL, totalCount)}
        {navItem("Favorites", "★", "favorite", FAV, favCount)}
      </div>

      {/* Folders */}
      {folders.length > 0 && (
        <div className="mt-3">
          <p className="text-[10px] uppercase font-mono font-semibold text-gh-muted px-2.5 mb-1 tracking-wider">Folders</p>
          {folders.map((folder) =>
            navItem(folder, "📁", "folder", folder)
          )}
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="mt-3">
          <p className="text-[10px] uppercase font-mono font-semibold text-gh-muted px-2.5 mb-1.5 tracking-wider">Tags</p>
          <div className="flex flex-wrap gap-1.5 px-2.5">
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => onFilterChange({ type: "tag", value: tag })}
                className={`text-[10px] px-1.5 py-0.5 rounded-md border font-mono transition-colors ${
                  isActive("tag", tag)
                    ? "bg-accent-light text-accent-fg border-accent-border"
                    : "bg-gh-subtle text-gh-muted border-gh-border hover:border-accent-border hover:text-gh-heading"
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
