// frontend/src/components/projects/KanbanColumn.jsx
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import KanbanCard from "./KanbanCard";

const COLUMN_CONFIG = {
  "todo":        { label: "To Do",       accent: "border-gray-500/50",   badge: "bg-gray-700 text-gray-300",   dot: "bg-gray-400" },
  "in-progress": { label: "In Progress", accent: "border-indigo-500/50", badge: "bg-indigo-500/20 text-indigo-300", dot: "bg-indigo-400" },
  "done":        { label: "Done",        accent: "border-emerald-500/50",badge: "bg-emerald-500/20 text-emerald-300", dot: "bg-emerald-400" },
};

export default function KanbanColumn({ status, projects, onEdit, onDelete, onAddNew }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const config = COLUMN_CONFIG[status];

  return (
    <div
      className={`flex flex-col w-72 shrink-0 rounded-2xl border-t-2 ${config.accent} bg-white/3 dark:bg-gray-900/40 backdrop-blur-sm`}
    >
      {/* Column header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${config.dot}`} />
          <h2 className="text-sm font-semibold text-gray-200">{config.label}</h2>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${config.badge}`}>
            {projects.length}
          </span>
        </div>
        <button
          onClick={() => onAddNew(status)}
          className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          title={`Add to ${config.label}`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`flex-1 flex flex-col gap-2 px-3 pb-4 min-h-[120px] rounded-b-2xl transition-colors duration-200 ${
          isOver ? "bg-indigo-500/8" : ""
        }`}
      >
        <SortableContext items={projects.map((p) => p._id)} strategy={verticalListSortingStrategy}>
          {projects.map((project) => (
            <KanbanCard
              key={project._id}
              project={project}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </SortableContext>

        {/* Empty state drop hint */}
        {projects.length === 0 && (
          <div className="flex-1 flex items-center justify-center min-h-[80px] border-2 border-dashed border-white/10 rounded-xl">
            <p className="text-xs text-gray-500">Drop here</p>
          </div>
        )}
      </div>
    </div>
  );
}
