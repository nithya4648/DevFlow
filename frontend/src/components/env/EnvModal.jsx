import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";

export default function EnvModal({ isOpen, onClose, onSubmit, initialData, isLoading, projectId }) {
  const overlayRef = useRef(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { key: "", value: "" },
  });

  useEffect(() => {
    if (initialData) {
      reset({ key: initialData.key, value: initialData.value });
    } else {
      reset({ key: "", value: "" });
    }
  }, [initialData, isOpen, reset]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  function handleOverlayClick(e) {
    if (e.target === overlayRef.current) onClose();
  }

  function onFormSubmit(data) {
    // Inject the current projectId context on create
    if (!initialData) {
      data.projectId = projectId === "global" ? null : projectId;
    }
    onSubmit(data);
  }

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4"
    >
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="font-display text-base font-bold text-slate-900 dark:text-slate-100">
            {initialData ? "Edit Variable" : "New Variable"}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Key *</label>
            <input
              {...register("key", { 
                required: "Key is required",
                pattern: { value: /^[a-zA-Z_][a-zA-Z0-9_]*$/, message: "Invalid characters (alphanumeric and underscore only)" }
              })}
              placeholder="e.g. DATABASE_URL"
              className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition font-mono"
            />
            {errors.key && <p className="text-xs text-rose-500 mt-1">{errors.key.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Value *</label>
            <textarea
              {...register("value", { required: "Value is required" })}
              placeholder="e.g. postgres://user:pass@localhost:5432/db"
              rows={4}
              className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition font-mono resize-none"
            />
            {errors.value && <p className="text-xs text-rose-500 mt-1">{errors.value.message}</p>}
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition shadow-xs"
            >
              {isLoading ? "Saving…" : "Save Variable"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
