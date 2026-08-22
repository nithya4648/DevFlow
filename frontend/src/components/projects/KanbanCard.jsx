import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const PRIORITY_CONFIG = {
  high:   { label: "High",   cls: "border-red-500/30 bg-red-500/10 text-red-400" },
  medium: { label: "Medium", cls: "border-amber-500/30 bg-amber-500/10 text-amber-400" },
  low:    { label: "Low",    cls: "border-accent-border bg-accent-light text-accent-fg" },
};

function formatDeadline(date) {
  if (!date) return null;
  const d = new Date(date);
  const now = new Date();
  const isOverdue = d < now;
  const formatted = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return { formatted, isOverdue };
}

export default function KanbanCard({ project, onEdit, onDelete, canEdit = true, canDelete = true }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: project._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 999 : "auto",
  };

  const priority = PRIORITY_CONFIG[project.priority] || PRIORITY_CONFIG.medium;
  const deadline = formatDeadline(project.deadline);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="group bg-gh-bg border border-gh-border rounded-md p-2.5 cursor-grab active:cursor-grabbing hover:border-accent-border hover:bg-gh-subtle transition-colors duration-150 select-none font-ui"
    >
      {/* Header: title + actions */}
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex-1 min-w-0">
          <h3 className="text-xs font-semibold text-gh-heading leading-snug line-clamp-2">
            {project.title}
          </h3>
        </div>
        {/* Action buttons */}
        <div
          className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
          onPointerDown={(e) => e.stopPropagation()}
        >
          {canEdit && (
            <button
              onClick={() => onEdit(project)}
              className="p-1 rounded text-gh-muted hover:text-accent-fg hover:bg-accent-light transition"
              title="Edit"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => onDelete(project._id)}
              className="p-1 rounded text-gh-muted hover:text-red-400 hover:bg-red-500/10 transition"
              title="Delete"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Description snippet */}
      {project.description && (
        <p className="text-[11px] text-gh-muted line-clamp-2 mb-2 font-mono">{project.description}</p>
      )}

      {/* Labels */}
      {project.labels?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {project.labels.slice(0, 3).map((label) => (
            <span
              key={label}
              className="gh-badge text-[9px]"
            >
              {label}
            </span>
          ))}
          {project.labels.length > 3 && (
            <span className="font-mono text-[9px] px-1.5 py-0.5 rounded-md bg-gh-subtle border border-gh-border text-gh-muted">
              +{project.labels.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Footer: priority + deadline */}
      <div className="flex items-center justify-between mt-1.5">
        <div className="flex items-center gap-1.5">
          <span className={`text-[9px] font-mono font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border ${priority.cls}`}>
            {priority.label}
          </span>
          <button
            onClick={() => onEdit(project)}
            className="p-1 rounded text-gh-muted hover:text-accent-fg transition"
            title="Comments & Details"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>
        </div>
        {deadline && (
          <span className={`font-mono text-[10px] flex items-center gap-1 ${deadline.isOverdue ? "text-red-400 font-semibold" : "text-gh-muted"}`}>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {deadline.formatted}
          </span>
        )}
      </div>
    </div>
  );
}
