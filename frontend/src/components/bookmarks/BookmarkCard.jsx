import { useState } from "react";

export default function BookmarkCard({ bookmark, onEdit, onDelete }) {
  let domain = "";
  try {
    const urlObj = new URL(bookmark.url);
    domain = urlObj.hostname;
  } catch (e) {
    domain = "";
  }

  const faviconUrl = domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=64` : "";

  return (
    <div className="group flex flex-col gh-card p-3.5 hover:border-accent-border transition-colors h-full font-ui">
      {/* Header: Favicon + Title */}
      <div className="flex items-start gap-2.5 mb-2.5">
        {faviconUrl ? (
          <img src={faviconUrl} alt="favicon" className="w-7 h-7 rounded-md bg-gh-subtle p-0.5 shrink-0 border border-gh-border" />
        ) : (
          <div className="w-7 h-7 rounded-md bg-gh-subtle flex items-center justify-center shrink-0 border border-gh-border">
            <span className="text-xs">🌐</span>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-gh-heading hover:text-accent-fg truncate block transition-colors leading-tight mb-0.5"
          >
            {bookmark.title}
          </a>
          <p className="font-mono text-[10px] text-gh-muted truncate" title={bookmark.url}>
            {domain || bookmark.url}
          </p>
        </div>
      </div>

      {/* Notes */}
      <div className="flex-1 min-h-0 mb-3">
        {bookmark.notes ? (
          <p className="text-xs text-gh-text line-clamp-3 leading-relaxed">
            {bookmark.notes}
          </p>
        ) : (
          <p className="text-xs text-gh-muted italic font-mono">No notes.</p>
        )}
      </div>

      {/* Footer: Category badge & Actions */}
      <div className="flex items-center justify-between mt-auto pt-2.5 border-t border-gh-border">
        <span className="gh-badge font-mono uppercase tracking-wider text-[9px]">
          {bookmark.category}
        </span>

        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(bookmark)}
            className="p-1.5 rounded-md text-gh-muted hover:text-accent-fg hover:bg-accent-light transition"
            title="Edit"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(bookmark._id)}
            className="p-1.5 rounded-md text-gh-muted hover:text-red-400 hover:bg-red-500/10 transition"
            title="Delete"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
