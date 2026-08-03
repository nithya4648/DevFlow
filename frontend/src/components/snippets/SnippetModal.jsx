// frontend/src/components/snippets/SnippetModal.jsx
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import Editor from "@monaco-editor/react";
import { useTeams } from "../../hooks/useTeams";
import CommentSection from "../collaboration/CommentSection";

export const LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "rust", label: "Rust" },
  { value: "go", label: "Go" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "c", label: "C" },
  { value: "csharp", label: "C#" },
  { value: "php", label: "PHP" },
  { value: "ruby", label: "Ruby" },
  { value: "swift", label: "Swift" },
  { value: "kotlin", label: "Kotlin" },
  { value: "dart", label: "Dart" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "scss", label: "SCSS" },
  { value: "json", label: "JSON" },
  { value: "yaml", label: "YAML" },
  { value: "markdown", label: "Markdown" },
  { value: "sql", label: "SQL" },
  { value: "bash", label: "Bash" },
  { value: "shell", label: "Shell" },
  { value: "xml", label: "XML" },
  { value: "plaintext", label: "Plain Text" },
];

export default function SnippetModal({ isOpen, onClose, onSubmit, initialData, isLoading }) {
  const [tagInput, setTagInput] = useState("");
  const [code, setCode] = useState("");
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
      language: "javascript",
      description: "",
      folder: "",
      tags: [],
      isFavorite: false,
      teamId: "",
    },
  });

  const tags = watch("tags") || [];
  const selectedLang = watch("language");

  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title || "",
        language: initialData.language || "javascript",
        description: initialData.description || "",
        folder: initialData.folder || "",
        tags: initialData.tags || [],
        isFavorite: initialData.isFavorite || false,
        teamId: initialData.teamId ? (initialData.teamId._id || initialData.teamId) : "",
      });
      setCode(initialData.code || "");
    } else {
      reset({ title: "", language: "javascript", description: "", folder: "", tags: [], isFavorite: false, teamId: "" });
      setCode("");
    }
    setTagInput("");
  }, [initialData, isOpen, reset]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  function addTag(e) {
    e.preventDefault();
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed) && tags.length < 15) {
      setValue("tags", [...tags, trimmed]);
      setTagInput("");
    }
  }

  function removeTag(tag) {
    setValue("tags", tags.filter((t) => t !== tag));
  }

  function onFormSubmit(data) {
    if (!code.trim()) return;
    onSubmit({ ...data, code });
  }

  function handleOverlayClick(e) {
    if (e.target === overlayRef.current) onClose();
  }

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 font-ui"
    >
      <div className="w-full max-w-3xl bg-gh-surface border border-gh-border rounded-md shadow-lg flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gh-border shrink-0">
          <h2 className="text-sm font-bold text-gh-heading font-mono">
            {initialData ? "Edit Snippet" : "New Snippet"}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-gh-subtle text-gh-muted hover:text-gh-heading transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            {/* Metadata fields */}
            <div className="px-5 pt-4 space-y-4">
              {/* Title + Language */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-mono font-medium text-gh-muted mb-1">Title *</label>
                  <input
                    {...register("title", { required: "Title is required" })}
                    placeholder="Snippet title…"
                    className="gh-input text-sm w-full"
                  />
                  {errors.title && <p className="text-xs text-red-400 font-mono mt-1">{errors.title.message}</p>}
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

              {/* Tags + Team Scope */}
              <div className="grid grid-cols-2 gap-3">
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
                
                <div>
                  <label className="block text-xs font-mono font-medium text-gh-muted mb-1">Workspace Scoping (Team)</label>
                  <select {...register("teamId")} className="gh-input text-sm w-full">
                    <option value="" className="bg-gh-surface">Private (Personal)</option>
                    {teams.map((t) => (
                      <option key={t._id} value={t._id} className="bg-gh-surface">{t.name}</option>
                    ))}
                  </select>
                </div>
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
                  teamId={initialData.teamId?._id || initialData.teamId}
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
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  lineNumbers: "on",
                  wordWrap: "on",
                  padding: { top: 12, bottom: 12 },
                  renderLineHighlight: "line",
                  scrollbar: { vertical: "auto", horizontal: "auto" },
                  fontFamily: "JetBrains Mono, ui-monospace, monospace",
                }}
              />
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex justify-end gap-2 px-5 py-3.5 border-t border-gh-border shrink-0">
            <button type="button" onClick={onClose} className="btn-ghost text-xs">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !code.trim()}
              className="btn-primary text-xs"
            >
              {isLoading ? "Saving…" : initialData ? "Save Changes" : "Create Snippet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
