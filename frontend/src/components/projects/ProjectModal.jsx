import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import CommentSection from "../collaboration/CommentSection";

const STATUS_OPTIONS = [
  { value: "todo", label: "To Do" },
  { value: "in-progress", label: "In Progress" },
  { value: "done", label: "Done" },
];

const PRIORITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export default function ProjectModal({ isOpen, onClose, onSubmit, initialData, isLoading }) {
  const [labelInput, setLabelInput] = useState("");
  const overlayRef = useRef(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      status: "todo",
      priority: "medium",
      labels: [],
      deadline: "",
      category: "",
    },
  });

  const labels = watch("labels") || [];

  // Populate form when editing
  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title || "",
        description: initialData.description || "",
        status: initialData.status || "todo",
        priority: initialData.priority || "medium",
        labels: initialData.labels || [],
        deadline: initialData.deadline
          ? new Date(initialData.deadline).toISOString().split("T")[0]
          : "",
        category: initialData.category || "",
      });
    } else {
      reset({
        title: "",
        description: "",
        status: "todo",
        priority: "medium",
        labels: [],
        deadline: "",
        category: "",
      });
    }
  }, [initialData, reset, isOpen]);

  // Close on Escape
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  // Click outside overlay to close
  function handleOverlayClick(e) {
    if (e.target === overlayRef.current) onClose();
  }

  function addLabel(e) {
    e.preventDefault();
    const trimmed = labelInput.trim();
    if (trimmed && !labels.includes(trimmed)) {
      setValue("labels", [...labels, trimmed]);
      setLabelInput("");
    }
  }

  function removeLabel(tagToRemove) {
    setValue(
      "labels",
      labels.filter((l) => l !== tagToRemove)
    );
  }

  function onFormSubmit(data) {
    const payload = {
      ...data,
      deadline: data.deadline ? new Date(data.deadline).toISOString() : null,
      category: data.category || "",
    };
    onSubmit(payload);
  }

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
    >
      <div className="gh-card w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gh-border">
          <h2 className="text-sm font-bold font-mono text-gh-heading">
            {initialData ? "Edit Project" : "New Project"}
          </h2>
          <button
            onClick={onClose}
            className="text-gh-muted hover:text-gh-heading text-lg font-mono leading-none transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onFormSubmit)} className="p-5 space-y-4 overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-xs font-mono font-medium text-gh-muted mb-1">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              {...register("title", { required: "Title is required" })}
              placeholder="e.g. Redesign Landing Page"
              className="gh-input text-sm w-full"
            />
            {errors.title && (
              <p className="text-red-400 text-xs font-mono mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-mono font-medium text-gh-muted mb-1">Description</label>
            <textarea
              {...register("description")}
              rows={3}
              placeholder="What is this project about? (Markdown supported)"
              className="gh-input text-sm w-full resize-none font-mono"
            />
          </div>

          {/* Status + Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-medium text-gh-muted mb-1">Status</label>
              <select {...register("status")} className="gh-input text-sm w-full">
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-gh-surface">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-mono font-medium text-gh-muted mb-1">Priority</label>
              <select {...register("priority")} className="gh-input text-sm w-full">
                {PRIORITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-gh-surface">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category + Deadline */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-medium text-gh-muted mb-1">Category</label>
              <input
                {...register("category")}
                placeholder="e.g. Frontend, API"
                className="gh-input text-sm w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-medium text-gh-muted mb-1">Deadline</label>
              <input
                type="date"
                {...register("deadline")}
                className="gh-input text-sm w-full font-mono"
              />
            </div>
          </div>

          {/* Labels */}
          <div>
            <label className="block text-xs font-mono font-medium text-gh-muted mb-1">Labels</label>
            <div className="flex gap-2">
              <input
                value={labelInput}
                onChange={(e) => setLabelInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") addLabel(e); }}
                placeholder="Add label…"
                className="gh-input flex-1 text-xs font-mono"
              />
              <button
                onClick={addLabel}
                type="button"
                className="btn-secondary text-xs px-3 font-mono"
              >
                Add
              </button>
            </div>
            {labels.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {labels.map((label) => (
                  <span
                    key={label}
                    className="gh-badge-accent flex items-center gap-1"
                  >
                    {label}
                    <button
                      type="button"
                      onClick={() => removeLabel(label)}
                      className="hover:text-red-400 transition-colors leading-none"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Comments section if project exists */}
          {initialData?._id && (
            <CommentSection
              targetType="project"
              targetId={initialData._id}
            />
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-3 border-t border-gh-border">
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary text-xs"
            >
              {isLoading ? "Saving…" : initialData ? "Save Changes" : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
