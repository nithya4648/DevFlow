// frontend/src/components/docs/DocSidebar.jsx
import { useRef } from "react";

export default function DocSidebar({
  docs,
  categories,
  selectedDocId,
  onSelectDoc,
  onNewDoc,
  onDeleteDoc,
  searchValue,
  onSearch,
}) {
  const searchTimer = useRef(null);

  function handleSearch(e) {
    const val = e.target.value;
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => onSearch(val), 300);
  }

  // Group docs by category
  const grouped = categories.reduce((acc, cat) => {
    acc[cat] = docs.filter((d) => d.category === cat);
    return acc;
  }, {});

  // Docs with categories not in the meta list (edge case)
  const uncategorised = docs.filter((d) => !categories.includes(d.category));
  if (uncategorised.length) grouped["Other"] = uncategorised;

  const totalGroups = Object.entries(grouped);

  return (
    <aside className="w-60 shrink-0 flex flex-col border-r border-white/8 pr-4">
      {/* Search */}
      <div className="relative mb-3">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          defaultValue={searchValue}
          onChange={handleSearch}
          placeholder="Search docs…"
          className="w-full pl-8 pr-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition"
        />
      </div>

      {/* New doc */}
      <button
        onClick={onNewDoc}
        className="flex items-center gap-2 px-3 py-2 mb-3 bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 text-indigo-300 text-xs font-medium rounded-xl transition-all"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        New Document
      </button>

      {/* Doc list */}
      <div className="flex-1 overflow-y-auto space-y-4">
        {docs.length === 0 && (
          <p className="text-xs text-gray-600 px-1">No documents yet.</p>
        )}

        {totalGroups.map(([category, catDocs]) => (
          <div key={category}>
            <p className="text-[10px] uppercase font-semibold text-gray-600 tracking-wider px-1 mb-1">
              {category}
            </p>
            <div className="space-y-0.5">
              {catDocs.map((doc) => (
                <div
                  key={doc._id}
                  className={`group flex items-center justify-between rounded-xl px-2.5 py-2 cursor-pointer transition-all ${
                    selectedDocId === doc._id
                      ? "bg-indigo-600/20 text-indigo-300"
                      : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                  }`}
                  onClick={() => onSelectDoc(doc._id)}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-xs truncate">{doc.title}</span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDeleteDoc(doc._id); }}
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:text-red-400 transition-all"
                    title="Delete"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
