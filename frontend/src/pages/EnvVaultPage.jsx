// frontend/src/pages/EnvVaultPage.jsx
import { useState, useMemo } from "react";
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
          // If duplicate key error, alert user (backend sends 400)
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
    <div className="flex-1 flex flex-col min-w-0 max-w-5xl mx-auto w-full px-6 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
            Env Vault 🔐
          </h1>
          <p className="text-sm text-gray-400 mt-1 max-w-lg">
            Store environment variables and secrets securely. Values are encrypted at rest using AES-256-GCM.
            <br />
            <span className="text-amber-400/80 text-xs mt-1 inline-block">
              ⚠️ For convenience only. Do not use as a replacement for AWS Secrets Manager or HashiCorp Vault in production.
            </span>
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Scope Selector */}
          <div className="relative">
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2.5 bg-gray-900 border border-white/10 rounded-xl text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition cursor-pointer w-48"
            >
              <option value="global">Global (Unscoped)</option>
              <optgroup label="Projects">
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>{p.title}</option>
                ))}
              </optgroup>
            </select>
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-sm font-medium rounded-xl transition-colors shadow-lg shadow-rose-900/20"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Variable
          </button>
        </div>
      </div>

      {isError && (
        <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          Failed to load environment variables. {error?.response?.data?.message || error?.message}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-h-0">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 rounded-xl w-full" />
            <Skeleton className="h-12 rounded-xl w-full" />
            <Skeleton className="h-12 rounded-xl w-full" />
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
