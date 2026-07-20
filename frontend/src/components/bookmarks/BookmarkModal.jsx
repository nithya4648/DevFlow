// frontend/src/components/bookmarks/BookmarkModal.jsx
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
    >
      <div className="w-full max-w-lg bg-gray-900 border border-white/10 rounded-2xl shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-base font-semibold text-gray-100">
            {initialData ? "Edit Bookmark" : "Add Bookmark"}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">URL *</label>
            <input
              {...register("url", { 
                required: "URL is required",
                pattern: { value: /^https?:\/\//, message: "URL must start with http:// or https://" }
              })}
              placeholder="https://example.com"
              className="w-full bg-gray-800 border border-white/10 rounded-xl px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition"
            />
            {errors.url && <p className="text-xs text-red-400 mt-1">{errors.url.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Title *</label>
            <input
              {...register("title", { required: "Title is required" })}
              placeholder="e.g. React Documentation"
              className="w-full bg-gray-800 border border-white/10 rounded-xl px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition"
            />
            {errors.title && <p className="text-xs text-red-400 mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Category</label>
            <select
              {...register("category")}
              className="w-full bg-gray-800 border border-white/10 rounded-xl px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition"
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
            <label className="block text-xs font-medium text-gray-400 mb-1">Notes</label>
            <textarea
              {...register("notes")}
              placeholder="Optional notes or context..."
              rows={3}
              className="w-full bg-gray-800 border border-white/10 rounded-xl px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-400 hover:text-gray-200 transition">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors"
            >
              {isLoading ? "Saving…" : "Save Bookmark"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
