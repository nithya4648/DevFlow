import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import KanbanCard from "./KanbanCard";

const COLUMN_CONFIG = {
  "todo":        { label: "To Do",       accent: "border-slate-400/60", badge: "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300", dot: "bg-slate-400" },
  "in-progress": { label: "In Progress", accent: "border-teal-500/60", badge: "bg-teal-500/15 text-teal-700 dark:text-teal-300", dot: "bg-teal-500" },
  "done":        { label: "Done",        accent: "border-emerald-500/60",badge: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300", dot: "bg-emerald-500" },
};

export default function KanbanColumn({ status, projects, onEdit, onDelete, onAddNew, getPerms }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const config = COLUMN_CONFIG[status] || COLUMN_CONFIG["todo"];

  return (
    <div
      className={`flex flex-col w-72 shrink-0 rounded-xl border-t-2 ${config.accent} bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 shadow-xs`}
    >
      {/* Column header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800/60">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${config.dot}`} />
          <h2 className="font-display text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">{config.label}</h2>
          <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-semibold ${config.badge}`}>
            {projects.length}
          </span>
        </div>
        <button
          onClick={() => onAddNew(status)}
          className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
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
        className={`flex-1 flex flex-col gap-2 p-3 min-h-[140px] rounded-b-xl transition-colors duration-150 ${
          isOver ? "bg-emerald-500/5 dark:bg-emerald-500/10" : ""
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
          <div className="flex-1 flex items-center justify-center min-h-[80px] border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
            <p className="font-mono text-xs text-slate-400 dark:text-slate-500">Drop cards here</p>
          </div>
        )}
      </div>
    </div>
  );
}
