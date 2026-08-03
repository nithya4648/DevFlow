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
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4"
    >
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="font-display text-base font-bold text-slate-900 dark:text-slate-100">
            {initialData ? "Edit Project" : "New Project"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onFormSubmit)} className="px-6 py-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Title *</label>
            <input
              {...register("title", { required: "Title is required", maxLength: { value: 120, message: "Max 120 chars" } })}
              placeholder="Project title…"
              className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition"
            />
            {errors.title && <p className="text-xs text-rose-500 mt-1">{errors.title.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
            <textarea
              {...register("description", { maxLength: { value: 2000, message: "Max 2000 chars" } })}
              rows={3}
              placeholder="Brief description…"
              className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition resize-none"
            />
          </div>

          {/* Status + Priority row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Status</label>
              <select
                {...register("status")}
                className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Priority</label>
              <select
                {...register("priority")}
                className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition"
              >
                {PRIORITY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Deadline + Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Deadline</label>
              <input
                type="date"
                {...register("deadline")}
                className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Category / Folder</label>
              <input
                {...register("category", { maxLength: { value: 60, message: "Max 60 chars" } })}
                placeholder="e.g. Work, Personal"
                className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition"
              />
            </div>
          </div>

          {/* Labels */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Labels</label>
            <div className="flex gap-2">
              <input
                value={labelInput}
                onChange={(e) => setLabelInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") addLabel(e); }}
                placeholder="Add label…"
                className="flex-1 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-mono transition"
              />
              <button
                onClick={addLabel}
                type="button"
                className="px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-mono font-semibold rounded-lg text-xs transition border border-emerald-500/20"
              >
                Add
              </button>
            </div>
            {labels.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {labels.map((label) => (
                  <span
                    key={label}
                    className="flex items-center gap-1 text-xs px-2 py-0.5 rounded font-mono bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
                  >
                    {label}
                    <button
                      type="button"
                      onClick={() => removeLabel(label)}
                      className="hover:text-rose-500 transition-colors"
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
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Workspace Scoping (Team)</label>
            <select
              {...register("teamId")}
              className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition"
            >
              <option value="">Private (Personal)</option>
              {teams.map((t) => (
                <option key={t._id} value={t._id}>{t.name}</option>
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
          <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition shadow-xs"
            >
              {isLoading ? "Saving…" : initialData ? "Save Changes" : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
