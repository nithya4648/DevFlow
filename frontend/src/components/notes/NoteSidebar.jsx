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
    <aside className="w-52 shrink-0 flex flex-col border-r border-slate-200/80 dark:border-slate-800 pr-3">
      {/* Search */}
      <div className="relative mb-4">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          defaultValue={searchValue}
          onChange={handleSearch}
          placeholder="Search notes…"
          className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition"
        />
      </div>

      <p className="font-display text-[11px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider px-2 mb-2">Folders</p>
      
      <div className="flex-1 overflow-y-auto space-y-0.5">
        <button
          onClick={() => onFolderChange(null)}
          className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-all ${
            isActive(null)
              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-500/20"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent"
          }`}
        >
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <span className="truncate">All Notes</span>
        </button>

        {folders.map((folder) => (
          <button
            key={folder}
            onClick={() => onFolderChange(folder)}
            className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-all ${
              isActive(folder)
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-500/20"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent"
            }`}
          >
            <span className="shrink-0">📁</span>
            <span className="truncate">{folder}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}
