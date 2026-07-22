// frontend/src/pages/ProjectsPage.jsx
import { useContext, useState, useCallback } from "react";
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject } from "../hooks/useProjects";
import KanbanBoard from "../components/projects/KanbanBoard";
import CalendarView from "../components/projects/CalendarView";
import ProjectModal from "../components/projects/ProjectModal";
import ProjectFilters from "../components/projects/ProjectFilters";
import { Skeleton } from "../components/ui/Skeleton";
import { AuthContext } from "../context/AuthContext";
import { useTeams } from "../hooks/useTeams";

const VIEW_KANBAN = "kanban";
const VIEW_CALENDAR = "calendar";

function EmptyState({ onAdd }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-20 h-20 mb-5 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
        <svg className="w-10 h-10 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-200 mb-2">No projects yet</h3>
      <p className="text-sm text-gray-500 mb-6 max-w-xs">
        Create your first project to start tracking progress with Kanban or Calendar views.
      </p>
      <button
        onClick={onAdd}
        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-colors"
      >
        + New Project
      </button>
    </div>
  );
}

function ProjectsSkeleton() {
  return (
    <div className="flex gap-5 overflow-x-hidden">
      {[1, 2, 3].map((col) => (
        <div key={col} className="flex flex-col gap-3 w-72 shrink-0">
          <Skeleton className="h-8 w-32 rounded-lg" />
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ))}
    </div>
  );
}

export default function ProjectsPage() {
  const { user } = useContext(AuthContext);
  const { data: teamsData } = useTeams();
  const teams = teamsData?.data || [];

  const [view, setView] = useState(VIEW_KANBAN);
  const [filters, setFilters] = useState({ search: "", status: "", priority: "" });
  const [modalOpen, setModalOpen] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [defaultStatus, setDefaultStatus] = useState("todo");

  // Helper: given a project return the current user's edit/delete capability
  const getPerms = useCallback((project) => {
    const teamId = project.teamId?._id || project.teamId;
    if (!teamId) return { canEdit: true, canDelete: true }; // private
    const team = teams.find((t) => t._id === teamId);
    const member = team?.members?.find((m) => (m.user?._id || m.user) === user?._id);
    const role = member?.role || "viewer";
    return {
      canEdit: role === "admin" || role === "editor",
      canDelete: role === "admin",
    };
  }, [teams, user]);

  // Strip empty filter keys before sending to API
  const activeFilters = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== "")
  );

  const { data, isLoading, isError } = useProjects(activeFilters);
  const createMutation = useCreateProject();
  const updateMutation = useUpdateProject();
  const deleteMutation = useDeleteProject();

  const projects = data?.data || [];

  function openCreateModal(status = "todo") {
    setEditProject(null);
    setDefaultStatus(status);
    setModalOpen(true);
  }

  function openEditModal(project) {
    setEditProject(project);
    setModalOpen(true);
  }

  function handleModalSubmit(formData) {
    if (editProject) {
      updateMutation.mutate(
        { id: editProject._id, data: formData },
        { onSuccess: () => setModalOpen(false) }
      );
    } else {
      createMutation.mutate(
        { ...formData, status: formData.status || defaultStatus },
        { onSuccess: () => setModalOpen(false) }
      );
    }
  }

  function handleStatusChange(projectId, newStatus) {
    updateMutation.mutate({ id: projectId, data: { status: newStatus } });
  }

  function handleDelete(projectId) {
    if (window.confirm("Delete this project?")) {
      deleteMutation.mutate(projectId);
    }
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Projects</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {projects.length} project{projects.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1 gap-1">
            <button
              onClick={() => setView(VIEW_KANBAN)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                view === VIEW_KANBAN
                  ? "bg-indigo-600 text-white shadow"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
              Kanban
            </button>
            <button
              onClick={() => setView(VIEW_CALENDAR)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                view === VIEW_CALENDAR
                  ? "bg-indigo-600 text-white shadow"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Calendar
            </button>
          </div>

          {/* New project button */}
          <button
            onClick={() => openCreateModal()}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-colors shadow-lg shadow-indigo-900/30"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Project
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-5">
        <ProjectFilters filters={filters} onChange={setFilters} />
      </div>

      {/* Error */}
      {isError && (
        <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          Failed to load projects. Make sure the backend is running.
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-auto">
        {isLoading ? (
          <ProjectsSkeleton />
        ) : projects.length === 0 && !activeFilters.search && !activeFilters.status && !activeFilters.priority ? (
          <EmptyState onAdd={() => openCreateModal()} />
        ) : view === VIEW_KANBAN ? (
          <KanbanBoard
            projects={projects}
            onStatusChange={handleStatusChange}
            onEdit={openEditModal}
            onDelete={handleDelete}
            onAddNew={openCreateModal}
            getPerms={getPerms}
          />
        ) : (
          <CalendarView projects={projects} onEdit={openEditModal} />
        )}

        {/* Filtered empty state */}
        {!isLoading && projects.length === 0 && (activeFilters.search || activeFilters.status || activeFilters.priority) && (
          <div className="flex flex-col items-center py-16 text-center">
            <p className="text-gray-500 text-sm">No projects match your filters.</p>
            <button
              onClick={() => setFilters({ search: "", status: "", priority: "" })}
              className="mt-3 text-indigo-400 hover:text-indigo-300 text-sm transition"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      <ProjectModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={editProject}
        isLoading={isSaving}
      />
    </div>
  );
}
