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
    <aside className="w-56 shrink-0 flex flex-col border-r border-gh-border pr-3 font-ui">
      {/* Search */}
      <div className="relative mb-2.5">
        <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gh-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          defaultValue={searchValue}
          onChange={handleSearch}
          placeholder="Search docs…"
          className="gh-input pl-8 text-xs"
        />
      </div>

      {/* New doc */}
      <button
        onClick={onNewDoc}
        className="btn-primary flex items-center gap-2 text-xs mb-3 w-full justify-center"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        New Document
      </button>

      {/* Doc list */}
      <div className="flex-1 overflow-y-auto space-y-4">
        {docs.length === 0 && (
          <p className="text-xs text-gh-muted font-mono px-1">No documents yet.</p>
        )}

        {totalGroups.map(([category, catDocs]) => (
          <div key={category}>
            <p className="text-[10px] uppercase font-mono font-semibold text-gh-muted tracking-wider px-1 mb-1">
              {category}
            </p>
            <div className="space-y-0.5">
              {catDocs.map((doc) => (
                <div
                  key={doc._id}
                  className={`group flex items-center justify-between rounded-md px-2 py-1.5 cursor-pointer transition-colors ${
                    selectedDocId === doc._id
                      ? "bg-accent-light text-accent-fg border border-accent-border"
                      : "text-gh-text hover:bg-gh-subtle hover:text-gh-heading border border-transparent"
                  }`}
                  onClick={() => onSelectDoc(doc._id)}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <svg className="w-3.5 h-3.5 shrink-0 text-gh-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-xs font-mono truncate">{doc.title}</span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDeleteDoc(doc._id); }}
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:text-red-400 text-gh-muted transition-all"
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
