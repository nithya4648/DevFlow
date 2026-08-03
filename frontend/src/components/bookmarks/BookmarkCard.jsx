import { useState } from "react";

export default function BookmarkCard({ bookmark, onEdit, onDelete }) {
  // Try to parse the domain for the favicon
  let domain = "";
  try {
    const urlObj = new URL(bookmark.url);
    domain = urlObj.hostname;
  } catch (e) {
    domain = "";
  }

  const faviconUrl = domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=64` : "";

  return (
    <div className="group flex flex-col bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 rounded-xl p-4 transition-all h-full shadow-xs">
      
      {/* Header: Favicon + Title */}
      <div className="flex items-start gap-3 mb-3">
        {faviconUrl ? (
          <img src={faviconUrl} alt="favicon" className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 p-1 shrink-0 border border-slate-200/60 dark:border-slate-700/60" />
        ) : (
          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-xs">🌐</span>
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-slate-900 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 truncate block transition-colors leading-tight mb-1"
          >
            {bookmark.title}
          </a>
          <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400 truncate" title={bookmark.url}>
            {domain || bookmark.url}
          </p>
        </div>
      </div>

      {/* Notes */}
      <div className="flex-1 min-h-0 mb-4">
        {bookmark.notes ? (
          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
            {bookmark.notes}
          </p>
        ) : (
          <p className="text-xs text-slate-400 dark:text-slate-500 italic">No notes.</p>
        )}
      </div>

      {/* Footer: Category badge & Actions */}
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100 dark:border-slate-800">
        <span className="px-2 py-0.5 text-[10px] uppercase font-mono font-semibold tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 rounded-md border border-emerald-500/20">
          {bookmark.category}
        </span>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(bookmark)}
            className="p-1.5 rounded-md text-slate-400 hover:text-emerald-600 hover:bg-emerald-500/10 transition"
            title="Edit"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(bookmark._id)}
            className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-500/10 transition"
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
