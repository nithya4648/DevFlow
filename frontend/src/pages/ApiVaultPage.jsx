// frontend/src/pages/ApiVaultPage.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import { apiVaultService } from "../services/apiVault.service";
import { useToast } from "../context/ToastContext";
import {
  FaPlus, FaSearch, FaKey, FaEye, FaEyeSlash, FaEdit, FaTrash,
  FaCopy, FaToggleOn, FaToggleOff, FaTimes, FaShieldAlt, FaCheck
} from "react-icons/fa";

const CATEGORIES = [
  { value: "payment", label: "Payment", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  { value: "ai", label: "AI", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  { value: "database", label: "Database", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  { value: "cloud", label: "Cloud", color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" },
  { value: "other", label: "Other", color: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
];

function getCategoryMeta(cat) {
  return CATEGORIES.find((c) => c.value === cat) || CATEGORIES[4];
}

function timeAgo(date) {
  if (!date) return "Never";
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return "Just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return new Date(date).toLocaleDateString();
}

const EMPTY_FORM = { name: "", key: "", value: "", category: "other", description: "" };

export default function ApiVaultPage() {
  const { addToast } = useToast();
  const [vaults, setVaults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  // Reveal
  const [revealedSecrets, setRevealedSecrets] = useState({}); // { vaultId: { key, value } }
  const revealTimers = useRef({});

  // Delete confirm
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Copied indicator
  const [copiedField, setCopiedField] = useState(null);

  // Fetch vaults
  const fetchVaults = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiVaultService.listVaults({ search, category: filterCat });
      setVaults(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load vaults");
    } finally {
      setLoading(false);
    }
  }, [search, filterCat]);

  useEffect(() => {
    fetchVaults();
  }, [fetchVaults]);

  // Cleanup reveal timers on unmount
  useEffect(() => {
    return () => {
      Object.values(revealTimers.current).forEach(clearTimeout);
    };
  }, []);

  // Modal helpers
  function openCreate() {
    setEditId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEdit(vault) {
    setEditId(vault._id);
    setForm({
      name: vault.name,
      key: "", // user must re-enter key/value for security
      value: "",
      category: vault.category,
      description: vault.description || "",
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditId(null);
    setForm(EMPTY_FORM);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editId) {
        // Only send fields that have values
        const payload = {};
        if (form.name) payload.name = form.name;
        if (form.key) payload.key = form.key;
        if (form.value) payload.value = form.value;
        if (form.category) payload.category = form.category;
        payload.description = form.description;
        await apiVaultService.updateVault(editId, payload);
        addToast("Vault entry updated", "success");
      } else {
        await apiVaultService.createVault(form);
        addToast("Vault entry created", "success");
      }
      closeModal();
      fetchVaults();
    } catch (err) {
      addToast(err.response?.data?.message || "Operation failed", "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    try {
      await apiVaultService.deleteVault(id);
      addToast("Vault entry deleted", "success");
      setDeleteConfirmId(null);
      fetchVaults();
    } catch (err) {
      addToast(err.response?.data?.message || "Delete failed", "error");
    }
  }

  async function handleReveal(id) {
    try {
      const res = await apiVaultService.revealVault(id);
      setRevealedSecrets((prev) => ({ ...prev, [id]: res.data }));
      // Auto-hide after 30 seconds
      if (revealTimers.current[id]) clearTimeout(revealTimers.current[id]);
      revealTimers.current[id] = setTimeout(() => {
        setRevealedSecrets((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      }, 30000);
      addToast("Key revealed for 30 seconds", "info");
    } catch (err) {
      addToast(err.response?.data?.message || "Reveal failed", "error");
    }
  }

  function hideRevealed(id) {
    if (revealTimers.current[id]) clearTimeout(revealTimers.current[id]);
    setRevealedSecrets((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  async function handleToggle(id) {
    try {
      const res = await apiVaultService.toggleActive(id);
      setVaults((prev) =>
        prev.map((v) => (v._id === id ? { ...v, isActive: res.data.isActive } : v))
      );
      addToast(res.data.isActive ? "Vault entry activated" : "Vault entry deactivated", "info");
    } catch (err) {
      addToast(err.response?.data?.message || "Toggle failed", "error");
    }
  }

  async function copyToClipboard(text, fieldLabel) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldLabel);
      setTimeout(() => setCopiedField(null), 2000);
      addToast("Copied to clipboard", "success");
    } catch {
      addToast("Failed to copy", "error");
    }
  }

  const activeCount = vaults.filter((v) => v.isActive).length;

  return (
    <div className="flex-1 flex flex-col min-w-0 max-w-5xl mx-auto w-full px-2 sm:px-6 py-6 font-ui">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gh-heading font-mono flex items-center gap-2">
            <FaShieldAlt className="text-accent" /> API Vault
          </h1>
          <p className="text-xs text-gh-muted font-mono mt-1 max-w-lg">
            Securely store and manage your API keys and secrets. Values are encrypted at rest with AES-256-GCM.
          </p>
          {!loading && (
            <p className="text-[11px] text-gh-muted font-mono mt-1">
              {vaults.length} {vaults.length === 1 ? "entry" : "entries"} &middot; {activeCount} active
            </p>
          )}
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Search */}
          <div className="relative">
            <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-gh-muted" />
            <input
              type="text"
              placeholder="Search vaults..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="gh-input text-xs font-mono pl-7 w-44"
            />
          </div>

          {/* Category filter */}
          <select
            value={filterCat}
            onChange={(e) => setFilterCat(e.target.value)}
            className="gh-input text-xs font-mono w-32"
          >
            <option value="all" className="bg-gh-surface">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value} className="bg-gh-surface">{c.label}</option>
            ))}
          </select>

          {/* Add button */}
          <button
            onClick={openCreate}
            className="btn-primary flex items-center gap-1.5 text-xs font-mono"
          >
            <FaPlus className="w-3 h-3" /> Add Key
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono">
          {error}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-h-0">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-lg bg-gh-subtle animate-pulse border border-gh-border" />
            ))}
          </div>
        ) : vaults.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <FaKey className="h-10 w-10 text-gh-muted mb-4 opacity-40" />
            <h3 className="text-sm font-semibold text-gh-heading font-mono mb-1">No API keys stored yet</h3>
            <p className="text-xs text-gh-muted font-mono mb-4 max-w-sm">
              Securely store your API keys, tokens, and secrets. They&apos;re encrypted before being saved.
            </p>
            <button onClick={openCreate} className="btn-primary text-xs font-mono flex items-center gap-1.5">
              <FaPlus className="w-3 h-3" /> Add Your First Key
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {vaults.map((vault) => {
              const catMeta = getCategoryMeta(vault.category);
              const revealed = revealedSecrets[vault._id];
              const isRevealed = !!revealed;

              return (
                <div
                  key={vault._id}
                  className={`rounded-lg border p-4 transition-all duration-150 ${
                    vault.isActive
                      ? "border-gh-border bg-gh-surface hover:border-accent-border/50"
                      : "border-gh-border/50 bg-gh-subtle/50 opacity-60"
                  }`}
                >
                  {/* Row 1: Name + badges + actions */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5 flex-wrap min-w-0">
                      <FaKey className="h-3.5 w-3.5 text-accent shrink-0" />
                      <span className="text-sm font-semibold text-gh-heading font-mono truncate">
                        {vault.name}
                      </span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${catMeta.color}`}>
                        {catMeta.label}
                      </span>
                      {!vault.isActive && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 border border-red-500/20">
                          Inactive
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Reveal/Hide */}
                      <button
                        onClick={() => isRevealed ? hideRevealed(vault._id) : handleReveal(vault._id)}
                        className="btn-secondary p-1.5"
                        title={isRevealed ? "Hide" : "Reveal key"}
                      >
                        {isRevealed ? <FaEyeSlash className="h-3 w-3" /> : <FaEye className="h-3 w-3" />}
                      </button>

                      {/* Copy key */}
                      {isRevealed && (
                        <button
                          onClick={() => copyToClipboard(revealed.key, `key-${vault._id}`)}
                          className="btn-secondary p-1.5"
                          title="Copy key"
                        >
                          {copiedField === `key-${vault._id}` ? <FaCheck className="h-3 w-3 text-green-400" /> : <FaCopy className="h-3 w-3" />}
                        </button>
                      )}

                      {/* Toggle */}
                      <button
                        onClick={() => handleToggle(vault._id)}
                        className="btn-secondary p-1.5"
                        title={vault.isActive ? "Deactivate" : "Activate"}
                      >
                        {vault.isActive
                          ? <FaToggleOn className="h-3.5 w-3.5 text-green-400" />
                          : <FaToggleOff className="h-3.5 w-3.5 text-gh-muted" />}
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => openEdit(vault)}
                        className="btn-secondary p-1.5"
                        title="Edit"
                      >
                        <FaEdit className="h-3 w-3" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => setDeleteConfirmId(vault._id)}
                        className="btn-secondary p-1.5 hover:!text-red-400 hover:!border-red-500/30"
                        title="Delete"
                      >
                        <FaTrash className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {/* Row 2: Key/Value display */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                    <div>
                      <span className="text-[10px] text-gh-muted font-mono uppercase tracking-wider">Key</span>
                      <div className="text-xs font-mono text-gh-text mt-0.5 bg-gh-bg rounded px-2 py-1.5 border border-gh-border break-all">
                        {isRevealed ? revealed.key : vault.key}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-gh-muted font-mono uppercase tracking-wider">Value</span>
                        {isRevealed && (
                          <button
                            onClick={() => copyToClipboard(revealed.value, `val-${vault._id}`)}
                            className="text-gh-muted hover:text-gh-heading transition"
                            title="Copy value"
                          >
                            {copiedField === `val-${vault._id}` ? <FaCheck className="h-2.5 w-2.5 text-green-400" /> : <FaCopy className="h-2.5 w-2.5" />}
                          </button>
                        )}
                      </div>
                      <div className="text-xs font-mono text-gh-text mt-0.5 bg-gh-bg rounded px-2 py-1.5 border border-gh-border break-all">
                        {isRevealed ? revealed.value : vault.value}
                      </div>
                    </div>
                  </div>

                  {/* Row 3: Description + meta */}
                  <div className="flex items-center justify-between gap-3">
                    {vault.description && (
                      <p className="text-[11px] text-gh-muted font-mono truncate max-w-md">
                        {vault.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 ml-auto text-[10px] text-gh-muted font-mono shrink-0">
                      {vault.lastUsed && <span>Used {timeAgo(vault.lastUsed)}</span>}
                      <span>Updated {timeAgo(vault.updatedAt)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60" onClick={() => setDeleteConfirmId(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-gh-surface border border-gh-border rounded-lg p-5 max-w-sm w-full shadow-xl">
              <h3 className="text-sm font-bold text-gh-heading font-mono mb-2">Delete Vault Entry?</h3>
              <p className="text-xs text-gh-muted font-mono mb-4">
                This action is permanent. The encrypted key and value will be permanently deleted.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="btn-secondary text-xs font-mono px-3 py-1.5"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirmId)}
                  className="bg-red-600 hover:bg-red-700 text-white text-xs font-mono px-3 py-1.5 rounded-md transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Create/Edit Modal */}
      {modalOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60" onClick={closeModal} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-gh-surface border border-gh-border rounded-lg p-5 max-w-md w-full shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gh-heading font-mono">
                  {editId ? "Edit Vault Entry" : "Add New API Key"}
                </h3>
                <button onClick={closeModal} className="text-gh-muted hover:text-gh-heading transition">
                  <FaTimes className="h-3.5 w-3.5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Name */}
                <div>
                  <label className="text-[11px] font-mono text-gh-muted uppercase tracking-wider block mb-1">
                    Name * <span className="text-[10px] text-gh-muted">(max 150 chars)</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder='e.g., "Stripe API Key"'
                    value={form.name}
                    onChange={(e) => {
                      if (e.target.value.length <= 150) setForm((f) => ({ ...f, name: e.target.value }));
                    }}
                    maxLength={150}
                    className="gh-input text-xs font-mono w-full"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="text-[11px] font-mono text-gh-muted uppercase tracking-wider block mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="gh-input text-xs font-mono w-full"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value} className="bg-gh-surface">{c.label}</option>
                    ))}
                  </select>
                </div>

                {/* Key */}
                <div>
                  <label className="text-[11px] font-mono text-gh-muted uppercase tracking-wider block mb-1">
                    API Key *{editId && " (leave blank to keep current)"} <span className="text-[10px] text-gh-muted">(max 500 chars)</span>
                  </label>
                  <input
                    type="password"
                    required={!editId}
                    placeholder="sk-proj-abc123..."
                    value={form.key}
                    onChange={(e) => {
                      if (e.target.value.length <= 500) setForm((f) => ({ ...f, key: e.target.value }));
                    }}
                    maxLength={500}
                    className="gh-input text-xs font-mono w-full"
                    autoComplete="off"
                  />
                </div>

                {/* Value */}
                <div>
                  <label className="text-[11px] font-mono text-gh-muted uppercase tracking-wider block mb-1">
                    Secret Value <span className="text-[10px] text-gh-muted">(max 10000 chars)</span>
                  </label>
                  <textarea
                    placeholder="Your secret value..."
                    value={form.value}
                    onChange={(e) => {
                      if (e.target.value.length <= 10000) setForm((f) => ({ ...f, value: e.target.value }));
                    }}
                    maxLength={10000}
                    className="gh-input text-xs font-mono w-full resize-none"
                    rows={3}
                    autoComplete="off"
                  />
                  <div className="text-[10px] text-gh-muted font-mono mt-0.5">
                    {(form.value?.length || 0)} / 10000 characters
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="text-[11px] font-mono text-gh-muted uppercase tracking-wider block mb-1">Description</label>
                  <input
                    type="text"
                    placeholder="What is this key used for?"
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    className="gh-input text-xs font-mono w-full"
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="btn-secondary text-xs font-mono px-3 py-1.5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary text-xs font-mono px-3 py-1.5 disabled:opacity-50"
                  >
                    {submitting ? "Saving..." : editId ? "Update" : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
