// frontend/src/pages/DocsPage.jsx
import { useState, useEffect } from "react";
import { useDocs, useDoc, useCreateDoc, useUpdateDoc, useDeleteDoc } from "../hooks/useDocs";
import DocSidebar from "../components/docs/DocSidebar";
import MarkdownEditor from "../components/docs/MarkdownEditor";
import DocVersionHistory from "../components/docs/DocVersionHistory";
import { Skeleton } from "../components/ui/Skeleton";

export default function DocsPage() {
  const [search, setSearch] = useState("");
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  // Fetch list of docs
  const { data: docsData, isLoading: loadingDocs, isError: docsError } = useDocs({ search });
  const docs = docsData?.data || [];
  const categories = docsData?.meta?.categories || [];

  // Fetch full detail of selected doc
  const { data: docDetailData, isLoading: loadingDetail } = useDoc(selectedDocId);
  const selectedDoc = docDetailData?.data;

  const createMutation = useCreateDoc();
  const updateMutation = useUpdateDoc();
  const deleteMutation = useDeleteDoc();

  // If we delete the currently selected doc, clear selection
  useEffect(() => {
    if (selectedDocId && !loadingDocs && !docs.find((d) => d._id === selectedDocId)) {
      setSelectedDocId(null);
      setShowHistory(false);
    }
  }, [docs, selectedDocId, loadingDocs]);

  function handleNewDoc() {
    createMutation.mutate(
      { title: "Untitled Document", category: "General", content: "" },
      {
        onSuccess: (res) => {
          setSelectedDocId(res.data._id);
          setShowHistory(false);
        },
      }
    );
  }

  function handleSaveDoc(updatedData) {
    if (!selectedDocId) return;
    updateMutation.mutate({ id: selectedDocId, data: updatedData });
  }

  function handleDeleteDoc(id) {
    if (window.confirm("Are you sure you want to delete this document? This cannot be undone.")) {
      deleteMutation.mutate(id);
    }
  }

  function handleRestoreVersion(version) {
    if (window.confirm("Restore this version? This will overwrite the current content (but the current content will be saved as a new version in history).")) {
      updateMutation.mutate({
        id: selectedDocId,
        data: { title: version.title, content: version.content },
      });
      setShowHistory(false);
    }
  }

  return (
    <div className="flex h-full min-h-0 relative">
      <DocSidebar
        docs={docs}
        categories={categories}
        selectedDocId={selectedDocId}
        onSelectDoc={(id) => {
          setSelectedDocId(id);
          setShowHistory(false);
        }}
        onNewDoc={handleNewDoc}
        onDeleteDoc={handleDeleteDoc}
        searchValue={search}
        onSearch={setSearch}
      />

      <div className="flex-1 flex flex-col min-w-0 px-6 pt-2 pb-6 relative">
        {docsError ? (
           <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
             Failed to load documents.
           </div>
        ) : loadingDocs && !selectedDocId ? (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-10 w-1/3 rounded-xl" />
            <div className="flex gap-4 flex-1">
              <Skeleton className="h-[60vh] flex-1 rounded-2xl" />
              <Skeleton className="h-[60vh] flex-1 rounded-2xl hidden xl:block" />
            </div>
          </div>
        ) : !selectedDocId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 mb-5 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
              <svg className="w-10 h-10 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-200 mb-2">Documentation Wiki</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-sm">
              Create and manage your project documentation, notes, and guides with full markdown support and version history.
            </p>
            <button
              onClick={handleNewDoc}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-colors"
            >
              + Create New Document
            </button>
          </div>
        ) : loadingDetail ? (
          <div className="flex flex-col gap-4 h-full">
            <Skeleton className="h-10 w-1/2 rounded-xl" />
            <div className="flex gap-4 flex-1">
              <Skeleton className="flex-1 rounded-2xl" />
            </div>
          </div>
        ) : selectedDoc ? (
          <div className="flex-1 flex flex-col min-h-0 relative">
             <div className="absolute right-0 top-0 z-10 flex items-center gap-3">
               <button
                 onClick={() => setShowHistory(true)}
                 className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-gray-200 border border-white/10 rounded-xl text-xs font-medium transition-all"
               >
                 <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                 </svg>
                 History
               </button>
             </div>
             
             <MarkdownEditor
               title={selectedDoc.title}
               content={selectedDoc.content}
               category={selectedDoc.category}
               onSave={handleSaveDoc}
               isSaving={updateMutation.isPending}
             />
          </div>
        ) : null}

        {/* History overlay */}
        {showHistory && selectedDocId && (
          <DocVersionHistory
            docId={selectedDocId}
            onClose={() => setShowHistory(false)}
            onRestore={handleRestoreVersion}
          />
        )}
      </div>
    </div>
  );
}
