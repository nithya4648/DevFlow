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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 font-ui"
    >
      <div className="w-full max-w-lg bg-gh-surface border border-gh-border rounded-md shadow-lg flex flex-col">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gh-border">
          <h2 className="text-sm font-bold text-gh-heading font-mono">
            {initialData ? "Edit Bookmark" : "Add Bookmark"}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-gh-subtle text-gh-muted hover:text-gh-heading transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-mono font-medium text-gh-muted mb-1">URL *</label>
            <input
              {...register("url", {
                required: "URL is required",
                pattern: { value: /^https?:\/\//, message: "URL must start with http:// or https://" }
              })}
              placeholder="https://example.com"
              className="gh-input text-sm font-mono w-full"
            />
            {errors.url && <p className="text-xs text-red-400 font-mono mt-1">{errors.url.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-mono font-medium text-gh-muted mb-1">Title *</label>
            <input
              {...register("title", { required: "Title is required" })}
              placeholder="e.g. React Documentation"
              className="gh-input text-sm w-full"
            />
            {errors.title && <p className="text-xs text-red-400 font-mono mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-mono font-medium text-gh-muted mb-1">Category</label>
            <select {...register("category")} className="gh-input text-sm w-full">
              <option value="website" className="bg-gh-surface">Website</option>
              <option value="docs" className="bg-gh-surface">Documentation</option>
              <option value="repo" className="bg-gh-surface">Repository</option>
              <option value="api" className="bg-gh-surface">API</option>
              <option value="article" className="bg-gh-surface">Article</option>
              <option value="video" className="bg-gh-surface">Video</option>
              <option value="other" className="bg-gh-surface">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono font-medium text-gh-muted mb-1">Notes</label>
            <textarea
              {...register("notes")}
              placeholder="Optional notes or context..."
              rows={3}
              className="gh-input text-sm resize-none w-full"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-gh-border">
            <button type="button" onClick={onClose} className="btn-ghost text-xs">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary text-xs"
            >
              {isLoading ? "Saving…" : "Save Bookmark"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
