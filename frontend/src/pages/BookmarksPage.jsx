// frontend/src/pages/BookmarksPage.jsx
import { useState } from "react";
import { useBookmarks, useCreateBookmark, useUpdateBookmark, useDeleteBookmark } from "../hooks/useBookmarks";
import BookmarkCard from "../components/bookmarks/BookmarkCard";
import BookmarkModal from "../components/bookmarks/BookmarkModal";
import { Skeleton } from "../components/ui/Skeleton";

export default function BookmarksPage() {
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editBookmark, setEditBookmark] = useState(null);

  const [searchInput, setSearchInput] = useState("");

  const { data: bookmarksData, isLoading, isError } = useBookmarks({
    category,
    search: searchInput,
  });
  const bookmarks = bookmarksData?.data || [];

  const createMutation = useCreateBookmark();
  const updateMutation = useUpdateBookmark();
  const deleteMutation = useDeleteBookmark();

  // Handle Search Input (simple debounce)
  let searchTimeout;
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => setSearchInput(val), 400);
  };

  const handleModalSubmit = (formData) => {
    if (editBookmark) {
      updateMutation.mutate(
        { id: editBookmark._id, data: formData },
        { onSuccess: () => setModalOpen(false) }
      );
    } else {
      createMutation.mutate(formData, { onSuccess: () => setModalOpen(false) });
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this bookmark?")) {
      deleteMutation.mutate(id);
    }
  };

  const categories = [
    { id: "all", label: "All" },
    { id: "docs", label: "Docs" },
    { id: "repo", label: "Repo" },
    { id: "website", label: "Website" },
    { id: "api", label: "API" },
    { id: "article", label: "Article" },
    { id: "video", label: "Video" },
  ];

  return (
    <div className="flex-1 flex flex-col min-w-0 max-w-7xl mx-auto w-full px-6 py-6 font-ui">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gh-heading font-mono">Bookmarks 🔖</h1>
          <p className="text-xs text-gh-muted font-mono mt-0.5">Manage your saved links and resources.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gh-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search bookmarks..."
              className="gh-input pl-8 text-xs font-mono w-56"
            />
          </div>

          <button
            onClick={() => { setEditBookmark(null); setModalOpen(true); }}
            className="btn-primary flex items-center gap-1.5 text-xs font-mono"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add Bookmark
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex overflow-x-auto gap-1.5 mb-5 pb-1">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategory(c.id)}
            className={`px-3 py-1 rounded-md text-xs font-mono transition-colors ${
              category === c.id
                ? "bg-accent-light text-accent-fg border border-accent-border font-semibold"
                : "btn-secondary"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {isError && (
        <div className="mb-4 p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono">
          Failed to load bookmarks.
        </div>
      )}

      {/* Grid */}
      <div className="flex-1 min-h-0">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28 rounded-md" />)}
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-56 text-center gh-card border-dashed">
            <span className="text-3xl mb-2">📭</span>
            <p className="text-gh-muted text-xs font-mono">No bookmarks found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
            {bookmarks.map((bookmark) => (
              <BookmarkCard
                key={bookmark._id}
                bookmark={bookmark}
                onEdit={(b) => { setEditBookmark(b); setModalOpen(true); }}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      <BookmarkModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={editBookmark}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
