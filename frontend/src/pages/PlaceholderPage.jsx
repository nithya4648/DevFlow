// src/pages/PlaceholderPage.jsx
// Generic placeholder for sidebar pages not yet built
export default function PlaceholderPage({ title = "Coming Soon", icon = "🚧" }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center gap-4 font-ui">
      <div className="text-6xl">{icon}</div>
      <div>
        <h1 className="text-xl font-bold text-gh-heading font-mono">{title}</h1>
        <p className="mt-1 text-xs text-gh-muted font-mono">
          This section is under construction. Check back soon!
        </p>
      </div>
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-accent-light border border-accent-border text-accent-fg text-xs font-mono">
        <span className="animate-pulse h-2 w-2 rounded-full bg-accent-fg" />
        Coming in a future milestone
      </div>
    </div>
  );
}
