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
        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all ${
          active
            ? "bg-indigo-600/25 text-indigo-300 font-medium"
            : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
        }`}
      >
        <span className="flex items-center gap-2 truncate">
          <span>{icon}</span>
          <span className="truncate">{label}</span>
        </span>
        {count !== undefined && (
          <span className={`text-xs px-1.5 py-0.5 rounded-full ${active ? "bg-indigo-500/30 text-indigo-300" : "bg-white/8 text-gray-500"}`}>
            {count}
          </span>
        )}
      </button>
    );
  }

  return (
    <aside className="w-52 shrink-0 flex flex-col gap-1 pr-2">
      {/* All + Favorites */}
      <div className="mb-1">
        {navItem("All Snippets", "⚡", "all", ALL, totalCount)}
        {navItem("Favorites", "⭐", "favorite", FAV, favCount)}
      </div>

      {/* Folders */}
      {folders.length > 0 && (
        <div className="mt-3">
          <p className="text-[10px] uppercase font-semibold text-gray-600 px-3 mb-1 tracking-wider">Folders</p>
          {folders.map((folder) =>
            navItem(folder, "📁", "folder", folder)
          )}
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="mt-3">
          <p className="text-[10px] uppercase font-semibold text-gray-600 px-3 mb-1 tracking-wider">Tags</p>
          <div className="flex flex-wrap gap-1.5 px-3">
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => onFilterChange({ type: "tag", value: tag })}
                className={`text-xs px-2 py-0.5 rounded-full border transition-all ${
                  isActive("tag", tag)
                    ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40"
                    : "bg-white/5 text-gray-400 border-white/10 hover:border-indigo-500/30 hover:text-gray-200"
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
