// frontend/src/pages/DocsPage.jsx
import { useState, useEffect } from "react";
import { useDocs, useDoc, useCreateDoc, useUpdateDoc, useDeleteDoc } from "../hooks/useDocs";
import DocSidebar from "../components/docs/DocSidebar";
import MarkdownEditor from "../components/docs/MarkdownEditor";
import DocVersionHistory from "../components/docs/DocVersionHistory";
import CommentSection from "../components/collaboration/CommentSection";
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
        },
      }
    );
  }

  function handleSaveDoc({ title, content, category }) {
    if (!selectedDocId) return;
    console.log('Saving doc:', { id: selectedDocId, title, content: content.substring(0, 50) + '...' });
    updateMutation.mutate({
      id: selectedDocId,
      data: { title, content, category },
    });
  }

  function handleDeleteDoc(docId) {
    deleteMutation.mutate(docId, {
      onSuccess: () => {
        if (selectedDocId === docId) {
          setSelectedDocId(null);
        }
      },
    });
  }

  function handleRestoreVersion(version) {
    if (!selectedDocId) return;
    updateMutation.mutate({
      id: selectedDocId,
      data: {
        title: version.title,
        content: version.content,
      },
    });
    setShowHistory(false);
  }

  return (
    <div className="flex-1 flex overflow-hidden font-ui flex-col lg:flex-row">
      {/* Sidebar listing */}
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
        isLoading={loadingDocs}
        searchValue={search}
        onSearch={setSearch}
      />

      <div className="flex-1 flex flex-col min-w-0 px-0 sm:px-0 pt-0 pb-0 relative overflow-hidden">
        {docsError ? (
          <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono">
            Failed to load documents.
          </div>
        ) : loadingDocs && !selectedDocId ? (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-9 w-1/3 rounded-md bg-gh-surface border border-gh-border" />
            <div className="flex gap-4 flex-1">
              <Skeleton className="h-[50vh] sm:h-[60vh] flex-1 rounded-md bg-gh-surface border border-gh-border" />
              <Skeleton className="h-[50vh] sm:h-[60vh] flex-1 rounded-md bg-gh-surface border border-gh-border hidden lg:block" />
            </div>
          </div>
        ) : !selectedDocId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center gh-card p-8">
            <div className="w-12 h-12 mb-4 rounded-md bg-accent-light border border-accent-border flex items-center justify-center text-accent-fg">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 01-2-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-base font-bold text-gh-heading mb-1">Documentation Wiki</h2>
            <p className="text-xs text-gh-muted mb-5 max-w-sm font-mono">
              Create and manage project docs, technical specs, and guides with full markdown support.
            </p>
            <button
              onClick={handleNewDoc}
              className="btn-primary text-xs"
            >
              + Create New Document
            </button>
          </div>
        ) : loadingDetail ? (
          <div className="flex flex-col gap-4 h-full">
            <Skeleton className="h-9 w-1/2 rounded-md bg-gh-surface border border-gh-border" />
            <div className="flex gap-4 flex-1">
              <Skeleton className="flex-1 rounded-md bg-gh-surface border border-gh-border" />
            </div>
          </div>
        ) : selectedDoc ? (
          <div className="flex-1 flex flex-col min-h-0 relative">
            <div className="absolute right-0 top-0 z-10 flex items-center gap-2">
              <button
                onClick={() => setShowHistory(true)}
                className="btn-secondary text-xs py-1 px-2.5"
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
              readOnly={false}
            />

            {/* Comments Thread */}
            <CommentSection
              targetType="doc"
              targetId={selectedDoc._id}
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
