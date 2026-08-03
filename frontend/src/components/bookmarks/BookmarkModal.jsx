import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";

export default function BookmarkModal({ isOpen, onClose, onSubmit, initialData, isLoading }) {
  const overlayRef = useRef(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { title: "", url: "", category: "website", notes: "" },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title,
        url: initialData.url,
        category: initialData.category,
        notes: initialData.notes,
      });
    } else {
      reset({ title: "", url: "", category: "website", notes: "" });
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

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4"
    >
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="font-display text-base font-bold text-slate-900 dark:text-slate-100">
            {initialData ? "Edit Bookmark" : "Add Bookmark"}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">URL *</label>
            <input
              {...register("url", { 
                required: "URL is required",
                pattern: { value: /^https?:\/\//, message: "URL must start with http:// or https://" }
              })}
              placeholder="https://example.com"
              className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-mono transition"
            />
            {errors.url && <p className="text-xs text-rose-500 mt-1">{errors.url.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Title *</label>
            <input
              {...register("title", { required: "Title is required" })}
              placeholder="e.g. React Documentation"
              className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition"
            />
            {errors.title && <p className="text-xs text-rose-500 mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
            <select
              {...register("category")}
              className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition"
            >
              <option value="website">Website</option>
              <option value="docs">Documentation</option>
              <option value="repo">Repository</option>
              <option value="api">API</option>
              <option value="article">Article</option>
              <option value="video">Video</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Notes</label>
            <textarea
              {...register("notes")}
              placeholder="Optional notes or context..."
              rows={3}
              className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition resize-none"
            />
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
              {isLoading ? "Saving…" : "Save Bookmark"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
