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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
    >
      <div className="w-full max-w-3xl bg-gray-900 border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
          <h2 className="text-base font-semibold text-gray-100">
            {initialData ? "Edit Snippet" : "New Snippet"}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            {/* Metadata fields */}
            <div className="px-6 pt-5 space-y-4">
              {/* Title + Language */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-400 mb-1">Title *</label>
                  <input
                    {...register("title", { required: "Title is required" })}
                    placeholder="Snippet title…"
                    className="w-full bg-gray-800 border border-white/10 rounded-xl px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition"
                  />
                  {errors.title && <p className="text-xs text-red-400 mt-1">{errors.title.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Language *</label>
                  <select
                    {...register("language")}
                    className="w-full bg-gray-800 border border-white/10 rounded-xl px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition"
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l.value} value={l.value}>{l.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description + Folder */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Description</label>
                  <input
                    {...register("description")}
                    placeholder="Short description…"
                    className="w-full bg-gray-800 border border-white/10 rounded-xl px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Folder</label>
                  <input
                    {...register("folder")}
                    placeholder="e.g. React Hooks, Utilities…"
                    className="w-full bg-gray-800 border border-white/10 rounded-xl px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition"
                  />
                </div>
              </div>

              {/* Tags + Team Scope */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Tags</label>
                  <div className="flex gap-2">
                    <input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") addTag(e); }}
                      placeholder="Add tag…"
                      className="flex-1 bg-gray-800 border border-white/10 rounded-xl px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition"
                    />
                    <button type="button" onClick={addTag} className="px-3 py-2 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 rounded-xl text-sm transition">
                      Add
                    </button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {tags.map((tag) => (
                        <span key={tag} className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
                          #{tag}
                          <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-400 transition-colors">×</button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Workspace Scoping (Team)</label>
                  <select
                    {...register("teamId")}
                    className="w-full bg-gray-800 border border-white/10 rounded-xl px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition"
                  >
                    <option value="">Private (Personal)</option>
                    {teams.map((t) => (
                      <option key={t._id} value={t._id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

            {/* Favorite toggle */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" {...register("isFavorite")} className="w-4 h-4 accent-indigo-500" />
              <span className="text-sm text-gray-400">Mark as favorite ⭐</span>
            </label>
          </div>

          {/* Comments section if snippet exists */}
          {initialData?._id && (
            <div className="px-6 border-t border-white/5">
              <CommentSection
                targetType="snippet"
                targetId={initialData._id}
                teamId={initialData.teamId?._id || initialData.teamId}
              />
            </div>
          )}

          {/* Monaco Editor */}
          <div className="mx-6 mt-4 mb-1">
            <label className="block text-xs font-medium text-gray-400 mb-1">
              Code * {!code.trim() && <span className="text-red-400">(required)</span>}
            </label>
          </div>
          <div className="mx-6 mb-4 rounded-xl overflow-hidden border border-white/10">
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
              }}
            />
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-white/10 shrink-0">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-400 hover:text-gray-200 transition">
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || !code.trim()}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors"
          >
            {isLoading ? "Saving…" : initialData ? "Save Changes" : "Create Snippet"}
          </button>
        </div>
        </form>
      </div>
    </div>
  );
}
