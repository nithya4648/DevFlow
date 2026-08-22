import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import Editor from "@monaco-editor/react";
import CommentSection from "../collaboration/CommentSection";

const LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "json", label: "JSON" },
  { value: "bash", label: "Bash / Shell" },
  { value: "sql", label: "SQL" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "java", label: "Java" },
  { value: "csharp", label: "C#" },
  { value: "cpp", label: "C++" },
  { value: "plaintext", label: "Plain Text" },
];

export default function SnippetModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
  canEdit = true,
}) {
  const [tagInput, setTagInput] = useState("");
  const [code, setCode] = useState("");
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
      language: "javascript",
      description: "",
      folder: "",
      tags: [],
      isFavorite: false,
    },
  });

  const tags = watch("tags") || [];
  const selectedLang = watch("language") || "javascript";

  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title || "",
        language: initialData.language || "javascript",
        description: initialData.description || "",
        folder: initialData.folder || "",
        tags: initialData.tags || [],
        isFavorite: initialData.isFavorite || false,
      });
      setCode(initialData.code || "");
    } else {
      reset({
        title: "",
        language: "javascript",
        description: "",
        folder: "",
        tags: [],
        isFavorite: false,
      });
      setCode("");
    }
  }, [initialData, reset, isOpen]);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  function handleOverlayClick(e) {
    if (e.target === overlayRef.current) onClose();
  }

  function addTag(e) {
    e.preventDefault();
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setValue("tags", [...tags, trimmed]);
      setTagInput("");
    }
  }

  function removeTag(tagToRemove) {
    setValue(
      "tags",
      tags.filter((t) => t !== tagToRemove)
    );
  }

  function onFormSubmit(data) {
    if (!code.trim()) return;
    onSubmit({
      ...data,
      code,
    });
  }

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
    >
      <div className="gh-card w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gh-border">
          <h2 className="text-sm font-bold font-mono text-gh-heading">
            {initialData ? (canEdit ? "Edit Snippet" : "View Snippet") : "New Snippet"}
          </h2>
          <button
            onClick={onClose}
            className="text-gh-muted hover:text-gh-heading text-lg font-mono leading-none transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Read-only banner */}
        {!canEdit && (
          <div className="px-5 py-2 bg-amber-500/10 border-b border-amber-500/20 text-amber-400 text-xs font-mono">
            You have viewer access only.
          </div>
        )}

        {/* Body */}
        <form onSubmit={handleSubmit(onFormSubmit)} className="flex-1 overflow-y-auto flex flex-col min-h-0">
          <div className="p-5 space-y-4">
            {/* Title + Language */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-mono font-medium text-gh-muted mb-1">Title *</label>
                <input
                  {...register("title", { required: "Title is required" })}
                  placeholder="e.g. useDebounce hook"
                  className="gh-input text-sm w-full"
                />
                {errors.title && (
                  <p className="text-red-400 text-xs font-mono mt-1">{errors.title.message}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-mono font-medium text-gh-muted mb-1">Language *</label>
                <select {...register("language")} className="gh-input text-sm w-full">
                  {LANGUAGES.map((l) => (
                    <option key={l.value} value={l.value} className="bg-gh-surface">{l.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description + Folder */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono font-medium text-gh-muted mb-1">Description</label>
                <input
                  {...register("description")}
                  placeholder="Short description…"
                  className="gh-input text-sm w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-mono font-medium text-gh-muted mb-1">Folder</label>
                <input
                  {...register("folder")}
                  placeholder="e.g. React Hooks…"
                  className="gh-input text-sm w-full"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-mono font-medium text-gh-muted mb-1">Tags</label>
              <div className="flex gap-2">
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") addTag(e); }}
                  placeholder="Add tag…"
                  className="gh-input flex-1 text-sm font-mono"
                />
                <button type="button" onClick={addTag} className="btn-secondary text-xs px-3 font-mono">Add</button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {tags.map((tag) => (
                    <span key={tag} className="gh-badge flex items-center gap-1">
                      #{tag}
                      <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-400 transition-colors">×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Favorite toggle */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" {...register("isFavorite")} className="w-4 h-4 accent-emerald-500" />
              <span className="text-xs text-gh-muted font-mono">Mark as favorite ★</span>
            </label>
          </div>

          {/* Comments section if snippet exists */}
          {initialData?._id && (
            <div className="px-5 border-t border-gh-border mt-4">
              <CommentSection
                targetType="snippet"
                targetId={initialData._id}
              />
            </div>
          )}

          {/* Monaco Editor */}
          <div className="mx-5 mt-4 mb-1">
            <label className="block text-xs font-mono font-medium text-gh-muted mb-1">
              Code * {!code.trim() && <span className="text-red-400">(required)</span>}
            </label>
          </div>
          <div className="mx-5 mb-4 rounded-md overflow-hidden border border-gh-border">
            <Editor
              height="200px"
              language={selectedLang}
              value={code}
              onChange={(val) => setCode(val || "")}
              theme="vs-dark"
              options={{
                fontSize: 13,
                fontFamily: "JetBrains Mono, Fira Code, monospace",
                minimap: { enabled: false },
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 8, bottom: 8 },
                readOnly: !canEdit,
              }}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 px-5 py-3 border-t border-gh-border bg-gh-surface/30">
            <button type="button" onClick={onClose} className="btn-ghost text-xs">
              {canEdit ? "Cancel" : "Close"}
            </button>
            {canEdit && (
              <button
                type="submit"
                disabled={isLoading || !code.trim()}
                className="btn-primary text-xs"
              >
                {isLoading ? "Saving…" : initialData ? "Save Changes" : "Create Snippet"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
