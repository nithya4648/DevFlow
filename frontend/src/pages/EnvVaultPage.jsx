// frontend/src/pages/EnvVaultPage.jsx
import { useState } from "react";
import { useEnvVars, useCreateEnvVar, useUpdateEnvVar, useDeleteEnvVar } from "../hooks/useEnv";
import EnvTable from "../components/env/EnvTable";
import EnvModal from "../components/env/EnvModal";
import { Skeleton } from "../components/ui/Skeleton";

export default function EnvVaultPage() {
  const [selectedProjectId, setSelectedProjectId] = useState("global");
  const [modalOpen, setModalOpen] = useState(false);
  const [editVar, setEditVar] = useState(null);

  // Fetch all for current scope
  const { data: envData, isLoading, isError, error } = useEnvVars({ projectId: selectedProjectId });
  const envVars = envData?.data || [];
  const projects = envData?.meta?.projects || [];

  const createMutation = useCreateEnvVar();
  const updateMutation = useUpdateEnvVar();
  const deleteMutation = useDeleteEnvVar();

  function openCreate() {
    setEditVar(null);
    setModalOpen(true);
  }

  function openEdit(envVar) {
    setEditVar(envVar);
    setModalOpen(true);
  }

  function handleModalSubmit(formData) {
    if (editVar) {
      updateMutation.mutate(
        { id: editVar._id, data: { key: formData.key, value: formData.value } },
        { onSuccess: () => setModalOpen(false) }
      );
    } else {
      createMutation.mutate(formData, {
        onSuccess: () => setModalOpen(false),
        onError: (err) => {
          const msg = err.response?.data?.message || err.message;
          alert(`Error: ${msg}`);
        }
      });
    }
  }

  function handleDelete(id) {
    if (window.confirm("Delete this environment variable?")) {
      deleteMutation.mutate(id);
    }
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 max-w-5xl mx-auto w-full px-6 py-6 font-ui">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gh-heading font-mono flex items-center gap-2">
            Env Vault 🔐
          </h1>
          <p className="text-xs text-gh-muted font-mono mt-1 max-w-lg">
            Store environment variables and secrets securely. Values are encrypted at rest using AES-256-GCM.
            <br />
            <span className="text-amber-400 text-[11px] mt-1 inline-block">
              ⚠️ For convenience only. Do not use as a replacement for AWS Secrets Manager or HashiCorp Vault in production.
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Scope Selector */}
          <div className="relative">
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="gh-input text-xs font-mono w-44"
            >
              <option value="global" className="bg-gh-surface">Global (Unscoped)</option>
              <optgroup label="Projects" className="bg-gh-surface">
                {projects.map((p) => (
                  <option key={p._id} value={p._id} className="bg-gh-surface">{p.title}</option>
                ))}
              </optgroup>
            </select>
          </div>

          <button
            onClick={openCreate}
            className="btn-primary flex items-center gap-1.5 text-xs font-mono"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Variable
          </button>
        </div>
      </div>

      {isError && (
        <div className="mb-4 p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono">
          Failed to load environment variables. {error?.response?.data?.message || error?.message}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-h-0">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 rounded-md w-full" />
            <Skeleton className="h-10 rounded-md w-full" />
            <Skeleton className="h-10 rounded-md w-full" />
          </div>
        ) : (
          <EnvTable
            envVars={envVars}
            onEdit={openEdit}
            onDelete={handleDelete}
          />
        )}
      </div>

      <EnvModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={editVar}
        isLoading={createMutation.isPending || updateMutation.isPending}
        projectId={selectedProjectId}
      />
    </div>
  );
}
