import { useRef } from "react";

export default function NoteSidebar({
  folders,
  activeFolder,
  onFolderChange,
  searchValue,
  onSearch,
}) {
  const searchTimer = useRef(null);

  function handleSearch(e) {
    const val = e.target.value;
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => onSearch(val), 300);
  }

  function isActive(folder) {
    return activeFolder === folder;
  }

  return (
    <aside className="w-48 shrink-0 flex flex-col border-r border-gh-border pr-3 font-ui">
      {/* Search */}
      <div className="relative mb-3">
        <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gh-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          defaultValue={searchValue}
          onChange={handleSearch}
          placeholder="Search notes…"
          className="gh-input pl-8 text-xs w-full"
        />
      </div>

      <p className="text-[10px] uppercase font-mono font-semibold text-gh-muted tracking-wider px-2 mb-2">Folders</p>

      <div className="flex-1 overflow-y-auto space-y-0.5">
        <button
          onClick={() => onFolderChange(null)}
          className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-mono transition-colors ${
            isActive(null)
              ? "bg-accent-light text-accent-fg border border-accent-border font-semibold"
              : "text-gh-text hover:text-gh-heading hover:bg-gh-subtle border border-transparent"
          }`}
        >
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <span className="truncate">All Notes</span>
        </button>

        {folders.map((folder) => (
          <button
            key={folder}
            onClick={() => onFolderChange(folder)}
            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-mono transition-colors ${
              isActive(folder)
                ? "bg-accent-light text-accent-fg border border-accent-border font-semibold"
                : "text-gh-text hover:text-gh-heading hover:bg-gh-subtle border border-transparent"
            }`}
          >
            <span className="shrink-0 text-[11px]">📁</span>
            <span className="truncate">{folder}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}
