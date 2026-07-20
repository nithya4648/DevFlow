// frontend/src/components/bookmarks/BookmarkCard.jsx
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
    <div className="group flex flex-col bg-gray-900/40 hover:bg-gray-900/60 border border-white/5 hover:border-cyan-500/30 rounded-2xl p-4 transition-all h-full">
      
      {/* Header: Favicon + Title */}
      <div className="flex items-start gap-3 mb-3">
        {faviconUrl ? (
          <img src={faviconUrl} alt="favicon" className="w-8 h-8 rounded-lg bg-white/10 p-1 shrink-0" />
        ) : (
          <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center shrink-0">
            <span className="text-xs">🌐</span>
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-gray-100 hover:text-cyan-400 truncate block transition-colors leading-tight mb-1"
          >
            {bookmark.title}
          </a>
          <p className="text-xs text-gray-500 truncate" title={bookmark.url}>
            {domain || bookmark.url}
          </p>
        </div>
      </div>

      {/* Notes */}
      <div className="flex-1 min-h-0 mb-4">
        {bookmark.notes ? (
          <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed">
            {bookmark.notes}
          </p>
        ) : (
          <p className="text-xs text-gray-600 italic">No notes.</p>
        )}
      </div>

      {/* Footer: Category badge & Actions */}
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
        <span className="px-2 py-1 text-[10px] uppercase font-bold tracking-wider text-cyan-400 bg-cyan-400/10 rounded-md">
          {bookmark.category}
        </span>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(bookmark)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-cyan-400 hover:bg-cyan-400/10 transition"
            title="Edit"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(bookmark._id)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition"
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
