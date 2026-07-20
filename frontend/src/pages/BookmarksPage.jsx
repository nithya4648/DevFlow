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

  // Use a local state for input to allow debouncing the actual search fetch if needed, 
  // but for now passing search directly to React Query handles it (if typing is fast, it might over-fetch, but acceptable here).
  // A better approach is to debounce the input value.
  const [searchInput, setSearchInput] = useState("");

  const { data: bookmarksData, isLoading, isError } = useBookmarks({
    category,
    search: searchInput, // In a real app, debounce this before passing to hook
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
    <div className="flex-1 flex flex-col min-w-0 max-w-7xl mx-auto w-full px-6 py-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Bookmarks 🔖</h1>
          <p className="text-sm text-gray-400 mt-1">Manage your saved links and resources.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search bookmarks..."
              className="pl-9 pr-4 py-2 bg-gray-900 border border-white/10 rounded-xl text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 w-64 transition"
            />
          </div>

          <button
            onClick={() => { setEditBookmark(null); setModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium rounded-xl transition-colors shadow-lg shadow-cyan-900/20"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add Bookmark
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-6 pb-2">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategory(c.id)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              category === c.id
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                : "bg-gray-900/50 text-gray-400 border border-white/5 hover:bg-gray-800"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {isError && (
        <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          Failed to load bookmarks.
        </div>
      )}

      {/* Grid */}
      <div className="flex-1 min-h-0">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center border border-dashed border-white/10 rounded-2xl">
            <span className="text-4xl mb-3">📭</span>
            <p className="text-gray-400 text-sm">No bookmarks found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
