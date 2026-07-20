// frontend/src/components/env/EnvModal.jsx
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
    >
      <div className="w-full max-w-lg bg-gray-900 border border-white/10 rounded-2xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-base font-semibold text-gray-100">
            {initialData ? "Edit Variable" : "New Variable"}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Key *</label>
            <input
              {...register("key", { 
                required: "Key is required",
                pattern: { value: /^[a-zA-Z_][a-zA-Z0-9_]*$/, message: "Invalid characters (alphanumeric and underscore only)" }
              })}
              placeholder="e.g. DATABASE_URL"
              className="w-full bg-gray-800 border border-white/10 rounded-xl px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition font-mono"
            />
            {errors.key && <p className="text-xs text-red-400 mt-1">{errors.key.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Value *</label>
            <textarea
              {...register("value", { required: "Value is required" })}
              placeholder="e.g. postgres://user:pass@localhost:5432/db"
              rows={4}
              className="w-full bg-gray-800 border border-white/10 rounded-xl px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition font-mono resize-none"
            />
            {errors.value && <p className="text-xs text-red-400 mt-1">{errors.value.message}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-400 hover:text-gray-200 transition">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors"
            >
              {isLoading ? "Saving…" : "Save Variable"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
