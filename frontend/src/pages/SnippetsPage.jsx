// frontend/src/pages/SnippetsPage.jsx
import { useContext, useRef, useState, useCallback } from "react";
import { useSnippets, useCreateSnippet, useUpdateSnippet, useDeleteSnippet } from "../hooks/useSnippets";
import SnippetSidebar from "../components/snippets/SnippetSidebar";
import SnippetCard from "../components/snippets/SnippetCard";
import SnippetModal from "../components/snippets/SnippetModal";
import { Skeleton } from "../components/ui/Skeleton";
import { AuthContext } from "../context/AuthContext";
import { useTeams } from "../hooks/useTeams";

const ALL_FILTER = { type: "all", value: "__all__" };

function buildApiFilters(activeFilter) {
  if (activeFilter.type === "all") return {};
  if (activeFilter.type === "favorite") return { favorite: "true" };
  if (activeFilter.type === "folder") return { folder: activeFilter.value };
  if (activeFilter.type === "tag") return { tag: activeFilter.value };
  return {};
}

function EmptyState({ onAdd }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-20 h-20 mb-5 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
        <svg className="w-10 h-10 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-200 mb-2">No snippets yet</h3>
      <p className="text-sm text-gray-500 mb-6 max-w-xs">
        Save reusable code snippets in any language with syntax highlighting, tags, and folders.
      </p>
      <button
        onClick={onAdd}
        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-colors"
      >
        + New Snippet
      </button>
    </div>
  );
}

function SnippetGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Skeleton key={i} className="h-52 rounded-2xl" />
      ))}
    </div>
  );
}

export default function SnippetsPage() {
  const { user } = useContext(AuthContext);
  const { data: teamsData } = useTeams();
  const teams = teamsData?.data || [];

  const [activeFilter, setActiveFilter] = useState(ALL_FILTER);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editSnippet, setEditSnippet] = useState(null);
  const searchTimer = useRef(null);

  // Per-snippet permission helper
  const getPerms = useCallback((snippet) => {
    const teamId = snippet.teamId?._id || snippet.teamId;
    if (!teamId) return { canEdit: true, canDelete: true };
    const team = teams.find((t) => t._id === teamId);
    const member = team?.members?.find((m) => (m.user?._id || m.user) === user?._id);
    const role = member?.role || "viewer";
    return {
      canEdit: role === "admin" || role === "editor",
      canDelete: role === "admin",
    };
  }, [teams, user]);

  const apiFilters = { ...buildApiFilters(activeFilter), ...(search ? { search } : {}) };

  const { data, isLoading, isError } = useSnippets(apiFilters);
  const createMutation = useCreateSnippet();
  const updateMutation = useUpdateSnippet();
  const deleteMutation = useDeleteSnippet();

  const snippets = data?.data || [];
  const meta = data?.meta || { folders: [], tags: [], total: 0 };
  const favCount = snippets.filter((s) => s.isFavorite).length;

  function handleSearch(e) {
    const val = e.target.value;
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setSearch(val), 350);
  }

  function openCreate() {
    setEditSnippet(null);
    setModalOpen(true);
  }

  function openEdit(snippet) {
    setEditSnippet(snippet);
    setModalOpen(true);
  }

  function handleModalSubmit(formData) {
    if (editSnippet) {
      updateMutation.mutate(
        { id: editSnippet._id, data: formData },
        { onSuccess: () => setModalOpen(false) }
      );
    } else {
      createMutation.mutate(formData, { onSuccess: () => setModalOpen(false) });
    }
  }

  function handleDelete(id) {
    if (window.confirm("Delete this snippet?")) deleteMutation.mutate(id);
  }

  function handleToggleFavorite(id, isFavorite) {
    updateMutation.mutate({ id, data: { isFavorite } });
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const hasFilters = activeFilter.type !== "all" || search;

  return (
    <div className="flex gap-6 h-full min-h-0">
      {/* Sidebar */}
      <SnippetSidebar
        folders={meta.folders}
        tags={meta.tags}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        totalCount={meta.total}
        favCount={favCount}
      />

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-5">
          <div>
            <h1 className="text-2xl font-bold text-gray-100">Snippets</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {snippets.length} snippet{snippets.length !== 1 ? "s" : ""}
              {activeFilter.type !== "all" && (
                <span className="ml-1 text-indigo-400">
                  {activeFilter.type === "folder" && `in "${activeFilter.value}"`}
                  {activeFilter.type === "tag" && `tagged #${activeFilter.value}`}
                  {activeFilter.type === "favorite" && "• Favorites"}
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                onChange={handleSearch}
                placeholder="Search snippets…"
                className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition w-56"
              />
            </div>

            {/* New snippet button */}
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-colors shadow-lg shadow-indigo-900/30"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Snippet
            </button>
          </div>
        </div>

        {/* Error */}
        {isError && (
          <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            Failed to load snippets. Make sure the backend is running.
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <SnippetGridSkeleton />
          ) : snippets.length === 0 && !hasFilters ? (
            <EmptyState onAdd={openCreate} />
          ) : snippets.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <p className="text-gray-500 text-sm">No snippets match your current filter.</p>
              <button
                onClick={() => { setActiveFilter(ALL_FILTER); setSearch(""); }}
                className="mt-3 text-indigo-400 hover:text-indigo-300 text-sm transition"
              >
                Clear filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {snippets.map((snippet) => {
                const { canEdit, canDelete } = getPerms(snippet);
                return (
                  <SnippetCard
                    key={snippet._id}
                    snippet={snippet}
                    onEdit={openEdit}
                    onDelete={handleDelete}
                    onToggleFavorite={handleToggleFavorite}
                    canEdit={canEdit}
                    canDelete={canDelete}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <SnippetModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={editSnippet}
        isLoading={isSaving}
      />
    </div>
  );
}
