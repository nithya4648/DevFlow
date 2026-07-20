// frontend/src/components/projects/KanbanCard.jsx
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const PRIORITY_CONFIG = {
  high:   { label: "High",   cls: "bg-red-500/20 text-red-400 border-red-500/30" },
  medium: { label: "Medium", cls: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  low:    { label: "Low",    cls: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
};

function formatDeadline(date) {
  if (!date) return null;
  const d = new Date(date);
  const now = new Date();
  const isOverdue = d < now;
  const formatted = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return { formatted, isOverdue };
}

export default function KanbanCard({ project, onEdit, onDelete }) {
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
      className="group bg-white/5 dark:bg-gray-800/60 border border-white/10 dark:border-gray-700/50 rounded-xl p-3.5 cursor-grab active:cursor-grabbing hover:border-indigo-500/40 hover:bg-white/8 transition-all duration-200 select-none shadow-sm hover:shadow-md"
    >
      {/* Header: title + actions */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-sm font-medium text-gray-100 leading-snug line-clamp-2 flex-1">
          {project.title}
        </h3>
        {/* Action buttons - shown on hover, pointer-events separate from drag */}
        <div
          className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => onEdit(project)}
            className="p-1 rounded-md hover:bg-indigo-500/20 text-gray-400 hover:text-indigo-400 transition-colors"
            title="Edit"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(project._id)}
            className="p-1 rounded-md hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
            title="Delete"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Description snippet */}
      {project.description && (
        <p className="text-xs text-gray-400 line-clamp-2 mb-2">{project.description}</p>
      )}

      {/* Labels */}
      {project.labels?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {project.labels.slice(0, 3).map((label) => (
            <span
              key={label}
              className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 font-medium"
            >
              {label}
            </span>
          ))}
          {project.labels.length > 3 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-700 text-gray-400">
              +{project.labels.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Footer: priority + deadline */}
      <div className="flex items-center justify-between mt-1.5">
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${priority.cls}`}>
          {priority.label}
        </span>
        {deadline && (
          <span className={`text-[10px] flex items-center gap-1 ${deadline.isOverdue ? "text-red-400" : "text-gray-400"}`}>
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
