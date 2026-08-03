import React, { useState, useEffect } from "react";
import { apiKeyService } from "../../services/apiKey.service";
import { useToast } from "../../context/ToastContext";
import { Key, Plus, Trash2, Copy, AlertCircle, CheckCircle2, Loader } from "lucide-react";
import useCopyToClipboard from "../../hooks/useCopyToClipboard";

const ApiKeysTab = () => {
  const { addToast } = useToast();
  const [, copyToClipboard] = useCopyToClipboard();

  const [apiKeys, setApiKeys] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newKeyLabel, setNewKeyLabel] = useState("");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [newlyGeneratedKey, setNewlyGeneratedKey] = useState(null);

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      const data = await apiKeyService.getApiKeys();
      setApiKeys(data.apiKeys);
    } catch (error) {
      addToast("Failed to fetch API keys", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateKey = async (e) => {
    e.preventDefault();
    if (!newKeyLabel.trim()) return;

    setIsGenerating(true);
    try {
      const data = await apiKeyService.createApiKey({ label: newKeyLabel });
      setApiKeys([data.apiKey, ...apiKeys]);
      setNewlyGeneratedKey(data.rawKey);
      setNewKeyLabel("");
      setShowModal(true);
      addToast("API key generated successfully", "success");
    } catch (error) {
      addToast(error.response?.data?.message || "Failed to generate API key", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRevokeKey = async (id) => {
    if (!window.confirm("Are you sure you want to revoke this API key? This action cannot be undone and any applications using it will lose access.")) {
      return;
    }

    try {
      await apiKeyService.revokeApiKey(id);
      setApiKeys(apiKeys.filter(key => key._id !== id));
      addToast("API key revoked", "success");
    } catch (error) {
      addToast("Failed to revoke API key", "error");
    }
  };

  const handleCopy = () => {
    if (newlyGeneratedKey) {
      copyToClipboard(newlyGeneratedKey);
      addToast("API key copied to clipboard", "success");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setNewlyGeneratedKey(null);
  };

  return (
    <div className="space-y-6 max-w-4xl font-ui">
      <div>
        <h2 className="text-base font-bold text-gh-heading font-mono flex items-center gap-2">
          <Key className="h-5 w-5 text-accent-fg" />
          API Keys
        </h2>
        <p className="mt-0.5 text-xs text-gh-muted font-mono">
          Manage API keys to access DevFlow programmatically.
        </p>
      </div>

      {/* Generate New Key Form */}
      <div className="gh-card p-4">
        <h3 className="text-xs font-mono font-bold text-gh-heading mb-3">Generate New Key</h3>
        <form onSubmit={handleGenerateKey} className="flex gap-3 items-end">
          <div className="flex-1">
            <label htmlFor="label" className="block text-xs font-mono text-gh-muted mb-1">
              Key Label
            </label>
            <input
              type="text"
              id="label"
              placeholder="e.g. CI/CD Pipeline, CLI Tool"
              value={newKeyLabel}
              onChange={(e) => setNewKeyLabel(e.target.value)}
              className="gh-input text-xs font-mono w-full"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isGenerating || !newKeyLabel.trim()}
            className="btn-primary text-xs font-mono shrink-0 h-8"
          >
            {isGenerating ? (
              <Loader className="animate-spin h-3.5 w-3.5" />
            ) : (
              <>
                <Plus className="h-3.5 w-3.5 mr-1" />
                Generate
              </>
            )}
          </button>
        </form>
      </div>

      {/* API Keys List */}
      <div>
        <h3 className="text-xs font-mono font-bold text-gh-heading mb-3">Active API Keys</h3>
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader className="h-6 w-6 animate-spin text-accent-fg" />
          </div>
        ) : apiKeys.length === 0 ? (
          <div className="text-center py-10 gh-card border-dashed">
            <Key className="mx-auto h-8 w-8 text-gh-muted" />
            <h3 className="mt-2 text-xs font-mono font-semibold text-gh-heading">No API keys</h3>
            <p className="mt-1 text-xs text-gh-muted font-mono">
              Generate an API key to get started.
            </p>
          </div>
        ) : (
          <div className="gh-card overflow-hidden">
            <ul className="divide-y divide-gh-border">
              {apiKeys.map((key) => (
                <li key={key._id} className="p-3.5 hover:bg-gh-subtle transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-mono font-semibold text-gh-heading">{key.label}</h4>
                      <div className="mt-1 font-mono text-xs text-accent-fg bg-gh-bg border border-gh-border px-2 py-0.5 rounded inline-block">
                        {key.prefix}
                      </div>
                      <p className="mt-1.5 text-[10px] text-gh-muted font-mono">
                        Created on {new Date(key.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRevokeKey(key._id)}
                      className="p-1.5 rounded-md text-gh-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Revoke Key"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* New Key Modal */}
      {showModal && newlyGeneratedKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg bg-gh-surface border border-gh-border rounded-md shadow-lg p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-accent-light text-accent-fg border border-accent-border">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gh-heading font-mono">API Key Generated</h3>
                <p className="text-xs text-gh-muted font-mono">Save this key now — it won't be shown again.</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gh-bg border border-gh-border rounded-md">
              <code className="text-xs font-mono text-accent-fg break-all select-all">
                {newlyGeneratedKey}
              </code>
              <button
                onClick={handleCopy}
                className="ml-3 shrink-0 p-1.5 rounded-md text-gh-muted hover:text-accent-fg hover:bg-accent-light transition-colors"
                title="Copy to clipboard"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-md text-xs font-mono text-amber-400">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <p>If you lose this key, you will need to generate a new one.</p>
            </div>

            <div className="flex justify-end pt-2 border-t border-gh-border">
              <button
                type="button"
                className="btn-primary text-xs font-mono"
                onClick={closeModal}
              >
                I have saved this key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiKeysTab;
