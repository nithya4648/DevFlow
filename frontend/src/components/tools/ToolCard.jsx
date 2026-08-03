// src/components/tools/ToolCard.jsx
// Shared card wrapper used inside each tool for sections
export default function ToolCard({ title, children, actions, className = "" }) {
  return (
    <div className={`gh-card ${className}`}>
      {(title || actions) && (
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-gh-border">
          {title && (
            <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-gh-muted">{title}</h3>
          )}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}
