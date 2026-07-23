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
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
          <Key className="h-6 w-6 mr-2 text-indigo-500" />
          API Keys
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage API keys to access DevFlow programmatically.
        </p>
      </div>

      {/* Generate New Key Form */}
      <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Generate New Key</h3>
        <form onSubmit={handleGenerateKey} className="flex gap-4 items-end">
          <div className="flex-1">
            <label htmlFor="label" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Key Label
            </label>
            <input
              type="text"
              id="label"
              placeholder="e.g., CI/CD Pipeline, CLI Tool"
              value={newKeyLabel}
              onChange={(e) => setNewKeyLabel(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isGenerating || !newKeyLabel.trim()}
            className="shrink-0 h-10 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? (
              <Loader className="animate-spin h-4 w-4" />
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Generate
              </>
            )}
          </button>
        </form>
      </div>

      {/* API Keys List */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Active API Keys</h3>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader className="h-8 w-8 animate-spin text-indigo-500" />
          </div>
        ) : apiKeys.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl border-dashed">
            <Key className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No API keys</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Generate an API key to get started.
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {apiKeys.map((key) => (
                <li key={key._id} className="p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">{key.label}</h4>
                      <div className="mt-1 flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded inline-block">
                        {key.prefix}
                      </div>
                      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        Created on {new Date(key.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRevokeKey(key._id)}
                      className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                      title="Revoke Key"
                    >
                      <Trash2 className="h-5 w-5" />
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
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500/75 dark:bg-gray-900/80 transition-opacity" aria-hidden="true" onClick={closeModal}></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-gray-200 dark:border-gray-700">
              <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 sm:mx-0 sm:h-10 sm:w-10">
                    <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                      API Key Generated
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Please copy this key and save it somewhere safe. For security reasons, <strong className="text-gray-700 dark:text-gray-300">we cannot show it to you again</strong>.
                      </p>
                      
                      <div className="mt-4 flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <code className="text-sm font-mono text-gray-800 dark:text-gray-200 break-all select-all">
                          {newlyGeneratedKey}
                        </code>
                        <button
                          onClick={handleCopy}
                          className="ml-4 shrink-0 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 focus:outline-none transition-colors p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                          title="Copy to clipboard"
                        >
                          <Copy className="h-5 w-5" />
                        </button>
                      </div>
                      
                      <div className="mt-4 flex items-start space-x-2 text-sm text-yellow-600 dark:text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-700/50">
                        <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                        <p>If you lose this key, you will need to generate a new one.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/80 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={closeModal}
                >
                  I have saved this key
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiKeysTab;
