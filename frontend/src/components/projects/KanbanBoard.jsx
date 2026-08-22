// frontend/src/components/projects/KanbanBoard.jsx
import { useState, memo } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import KanbanColumn from "./KanbanColumn";
import KanbanCard from "./KanbanCard";

const STATUSES = ["todo", "in-progress", "done"];

export default memo(function KanbanBoard({ projects, onStatusChange, onEdit, onDelete, onAddNew, getPerms }) {
  const [activeProject, setActiveProject] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Group projects by status
  const columns = STATUSES.reduce((acc, status) => {
    acc[status] = projects.filter((p) => p.status === status);
    return acc;
  }, {});

  function findProjectStatus(id) {
    return STATUSES.find((s) => columns[s].some((p) => p._id === id));
  }

  function handleDragStart({ active }) {
    const project = projects.find((p) => p._id === active.id);
    setActiveProject(project || null);
  }

  function handleDragEnd({ active, over }) {
    setActiveProject(null);
    if (!over) return;

    const activeStatus = findProjectStatus(active.id);
    // over.id is either a column id (status string) or a card id
    const overStatus = STATUSES.includes(over.id)
      ? over.id
      : findProjectStatus(over.id);

    if (activeStatus && overStatus && activeStatus !== overStatus) {
      onStatusChange(active.id, overStatus);
    }
  }

  function handleDragOver({ active, over }) {
    if (!over) return;
    // Allow dropping onto column containers directly
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            projects={columns[status]}
            onEdit={onEdit}
            onDelete={onDelete}
            onAddNew={onAddNew}
            getPerms={getPerms}
          />
        ))}
      </div>

      {/* Drag ghost overlay */}
      <DragOverlay>
        {activeProject ? (
          <div className="rotate-1 ring-1 ring-accent-border rounded-md opacity-90">
            <KanbanCard
              project={activeProject}
              onEdit={() => {}}
              onDelete={() => {}}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}, (prevProps, nextProps) => {
  return (
    JSON.stringify(prevProps.projects) === JSON.stringify(nextProps.projects) &&
    prevProps.onStatusChange === nextProps.onStatusChange &&
    prevProps.onEdit === nextProps.onEdit &&
    prevProps.onDelete === nextProps.onDelete &&
    prevProps.onAddNew === nextProps.onAddNew
  );
});
