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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 font-ui"
    >
      <div className="w-full max-w-lg bg-gh-surface border border-gh-border rounded-md shadow-lg flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gh-border">
          <h2 className="text-sm font-bold text-gh-heading font-mono">
            {initialData ? "Edit Variable" : "New Variable"}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-gh-subtle text-gh-muted hover:text-gh-heading transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit(onFormSubmit)} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-mono font-medium text-gh-muted mb-1">Key *</label>
            <input
              {...register("key", {
                required: "Key is required",
                pattern: { value: /^[a-zA-Z_][a-zA-Z0-9_]*$/, message: "Invalid characters (alphanumeric and underscore only)" }
              })}
              placeholder="e.g. DATABASE_URL"
              className="gh-input text-sm font-mono w-full"
            />
            {errors.key && <p className="text-xs text-red-400 font-mono mt-1">{errors.key.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-mono font-medium text-gh-muted mb-1">Value *</label>
            <textarea
              {...register("value", { required: "Value is required" })}
              placeholder="e.g. postgres://user:pass@localhost:5432/db"
              rows={4}
              className="gh-input text-sm font-mono resize-none w-full"
            />
            {errors.value && <p className="text-xs text-red-400 font-mono mt-1">{errors.value.message}</p>}
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
              {isLoading ? "Saving…" : "Save Variable"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
