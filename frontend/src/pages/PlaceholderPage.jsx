// src/pages/PlaceholderPage.jsx
// Generic placeholder for sidebar pages not yet built
export default function PlaceholderPage({ title = "Coming Soon", icon = "🚧" }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center gap-6">
      <div className="text-7xl">{icon}</div>
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">{title}</h1>
        <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
          This section is under construction. Check back soon!
        </p>
      </div>
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/10 text-indigo-500 text-xs font-bold">
        <span className="animate-pulse h-2 w-2 rounded-full bg-indigo-500" />
        Coming in a future milestone
      </div>
    </div>
  );
}
