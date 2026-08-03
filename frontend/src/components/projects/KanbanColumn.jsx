import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import KanbanCard from "./KanbanCard";

const COLUMN_CONFIG = {
  "todo":        { label: "To Do",       accent: "border-gh-muted", badge: "gh-badge", dot: "bg-gh-muted" },
  "in-progress": { label: "In Progress", accent: "border-accent-blue", badge: "gh-badge border-accent-blue/30 text-accent-blue bg-accent-blue/10", dot: "bg-accent-blue" },
  "done":        { label: "Done",        accent: "border-accent-border", badge: "gh-badge-accent", dot: "bg-accent-fg" },
};

export default function KanbanColumn({ status, projects, onEdit, onDelete, onAddNew, getPerms }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const config = COLUMN_CONFIG[status] || COLUMN_CONFIG["todo"];

  return (
    <div
      className={`flex flex-col w-72 shrink-0 rounded-md border-t-2 ${config.accent} bg-gh-surface border border-gh-border font-ui`}
    >
      {/* Column header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-gh-border">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${config.dot}`} />
          <h2 className="text-xs font-mono font-bold text-gh-heading uppercase tracking-wider">{config.label}</h2>
          <span className={config.badge}>
            {projects.length}
          </span>
        </div>
        <button
          onClick={() => onAddNew(status)}
          className="p-1 rounded-md hover:bg-gh-subtle text-gh-muted hover:text-gh-heading transition"
          title={`Add to ${config.label}`}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`flex-1 flex flex-col gap-2 p-2.5 min-h-[140px] rounded-b-md transition-colors duration-150 ${
          isOver ? "bg-accent-light" : ""
        }`}
      >
        <SortableContext items={projects.map((p) => p._id)} strategy={verticalListSortingStrategy}>
          {projects.map((project) => {
            const { canEdit, canDelete } = getPerms ? getPerms(project) : { canEdit: true, canDelete: true };
            return (
              <KanbanCard
                key={project._id}
                project={project}
                onEdit={onEdit}
                onDelete={onDelete}
                canEdit={canEdit}
                canDelete={canDelete}
              />
            );
          })}
        </SortableContext>

        {/* Empty state drop hint */}
        {projects.length === 0 && (
          <div className="flex-1 flex items-center justify-center min-h-[80px] border border-dashed border-gh-border rounded-md">
            <p className="font-mono text-xs text-gh-muted">Drop cards here</p>
          </div>
        )}
      </div>
    </div>
  );
}
