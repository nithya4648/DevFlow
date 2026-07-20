// src/components/tools/ToolCard.jsx
// Shared card wrapper used inside each tool for sections
export default function ToolCard({ title, children, actions, className = "" }) {
  return (
    <div className={`rounded-2xl border border-gray-150 bg-white dark:border-gray-800 dark:bg-gray-900/40 ${className}`}>
      {(title || actions) && (
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-gray-800">
          {title && (
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">{title}</h3>
          )}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}
