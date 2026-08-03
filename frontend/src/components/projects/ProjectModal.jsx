import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useTeams } from "../../hooks/useTeams";
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

  const { data: teamsRes } = useTeams();
  const teams = teamsRes?.data || [];

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
      teamId: "",
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
        teamId: initialData.teamId ? (initialData.teamId._id || initialData.teamId) : "",
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
        teamId: "",
      });
    }
    setLabelInput("");
  }, [initialData, isOpen, reset]);

  // Close on overlay click
  function handleOverlayClick(e) {
    if (e.target === overlayRef.current) onClose();
  }

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  function addLabel(e) {
    e.preventDefault();
    const trimmed = labelInput.trim();
    if (trimmed && !labels.includes(trimmed) && labels.length < 10) {
      setValue("labels", [...labels, trimmed]);
      setLabelInput("");
    }
  }

  function removeLabel(label) {
    setValue("labels", labels.filter((l) => l !== label));
  }

  function onFormSubmit(data) {
    const cleaned = {
      ...data,
      deadline: data.deadline ? new Date(data.deadline).toISOString() : null,
    };
    onSubmit(cleaned);
  }

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 font-ui"
    >
      <div className="w-full max-w-lg bg-gh-surface border border-gh-border rounded-md shadow-lg overflow-hidden">
        {/* Modal header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gh-border">
          <h2 className="text-sm font-bold text-gh-heading font-mono">
            {initialData ? "Edit Project" : "New Project"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-gh-subtle text-gh-muted hover:text-gh-heading transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onFormSubmit)} className="px-5 py-4 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-xs font-mono font-medium text-gh-muted mb-1">Title *</label>
            <input
              {...register("title", { required: "Title is required", maxLength: { value: 120, message: "Max 120 chars" } })}
              placeholder="Project title…"
              className="gh-input text-sm"
            />
            {errors.title && <p className="text-xs text-red-400 font-mono mt-1">{errors.title.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-mono font-medium text-gh-muted mb-1">Description</label>
            <textarea
              {...register("description", { maxLength: { value: 2000, message: "Max 2000 chars" } })}
              rows={3}
              placeholder="Brief description…"
              className="gh-input text-sm resize-none"
            />
          </div>

          {/* Status + Priority row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-medium text-gh-muted mb-1">Status</label>
              <select {...register("status")} className="gh-input text-sm w-full">
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value} className="bg-gh-surface">{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-mono font-medium text-gh-muted mb-1">Priority</label>
              <select {...register("priority")} className="gh-input text-sm w-full">
                {PRIORITY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value} className="bg-gh-surface">{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Deadline + Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-medium text-gh-muted mb-1">Deadline</label>
              <input
                type="date"
                {...register("deadline")}
                className="gh-input text-sm font-mono w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-medium text-gh-muted mb-1">Category / Folder</label>
              <input
                {...register("category", { maxLength: { value: 60, message: "Max 60 chars" } })}
                placeholder="e.g. Work, Personal"
                className="gh-input text-sm w-full"
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

          {/* Team Scope */}
          <div>
            <label className="block text-xs font-mono font-medium text-gh-muted mb-1">Workspace Scoping (Team)</label>
            <select {...register("teamId")} className="gh-input text-sm w-full">
              <option value="" className="bg-gh-surface">Private (Personal)</option>
              {teams.map((t) => (
                <option key={t._id} value={t._id} className="bg-gh-surface">{t.name}</option>
              ))}
            </select>
          </div>

          {/* Comments section if project exists */}
          {initialData?._id && (
            <CommentSection
              targetType="project"
              targetId={initialData._id}
              teamId={initialData.teamId?._id || initialData.teamId}
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
