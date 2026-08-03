import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const PRIORITY_CONFIG = {
  high:   { label: "High",   cls: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20" },
  medium: { label: "Medium", cls: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" },
  low:    { label: "Low",    cls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
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
      className="group bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/60 rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-emerald-500/40 hover:bg-white dark:hover:bg-slate-800 transition-all duration-150 select-none shadow-2xs hover:shadow-xs"
    >
      {/* Header: title + actions */}
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex-1 min-w-0">
          <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-snug line-clamp-2">
            {project.title}
          </h3>
          {project.teamId && (
            <span className="inline-flex items-center mt-1 font-mono text-[9px] font-semibold text-teal-600 dark:text-teal-400 bg-teal-500/10 px-1.5 py-0.5 rounded border border-teal-500/20">
              👥 {project.teamId.name || "Team"}
            </span>
          )}
        </div>
        {/* Action buttons */}
        <div
          className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
          onPointerDown={(e) => e.stopPropagation()}
        >
          {canEdit && (
            <button
              onClick={() => onEdit(project)}
              className="p-1 rounded text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-500/10 transition"
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
              className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-500/10 transition"
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
        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mb-2">{project.description}</p>
      )}

      {/* Labels */}
      {project.labels?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {project.labels.slice(0, 3).map((label) => (
            <span
              key={label}
              className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 font-medium"
            >
              {label}
            </span>
          ))}
          {project.labels.length > 3 && (
            <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
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
            className="p-1 rounded text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
            title="Comments & Details"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>
        </div>
        {deadline && (
          <span className={`font-mono text-[10px] flex items-center gap-1 ${deadline.isOverdue ? "text-rose-500 font-semibold" : "text-slate-400 dark:text-slate-500"}`}>
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
