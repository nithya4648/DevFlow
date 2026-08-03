import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export const DashboardCharts = ({ overview }) => {
  if (!overview) return null;

  const { weeklyActivity = [], projectsByStatus = [], topTools = [] } = overview;

  // Chart 1: Weekly Activity (Bar)
  const activityData = {
    labels: weeklyActivity.map((d) => new Date(d.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: "Activities",
        data: weeklyActivity.map((d) => d.count),
        backgroundColor: "#238636", // GitHub primary green
        borderRadius: 4,
      },
    ],
  };

  const activityOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      x: { grid: { color: "#21262d" }, ticks: { color: "#8b949e", font: { family: "JetBrains Mono", size: 10 } } },
      y: { beginAtZero: true, ticks: { precision: 0, color: "#8b949e", font: { family: "JetBrains Mono", size: 10 } }, grid: { color: "#21262d" } },
    },
  };

  // Chart 2: Projects by Status (Doughnut)
  const projectLabels = projectsByStatus.map((p) => p._id.charAt(0).toUpperCase() + p._id.slice(1));
  const projectCounts = projectsByStatus.map((p) => p.count);
  
  const statusColors = {
    "active": "#238636", // green
    "completed": "#58a6ff", // blue
    "archived": "#8b949e", // gray
    "planning": "#d29922", // yellow
  };

  const projectData = {
    labels: projectLabels,
    datasets: [
      {
        data: projectCounts,
        backgroundColor: projectsByStatus.map(p => statusColors[p._id.toLowerCase()] || "#8b949e"),
        borderColor: "#161b22",
        borderWidth: 2,
      },
    ],
  };

  const projectOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "right", labels: { color: "#c9d1d9", font: { family: "Inter", size: 11 } } },
    },
    cutout: "70%",
  };

  // Chart 3: Top Tools (Horizontal Bar)
  const toolNames = {
    "json-formatter": "JSON Formatter",
    "jwt-decoder": "JWT Decoder",
    "jwt-generator": "JWT Generator",
    "base64": "Base64",
    "uuid-generator": "UUID Gen",
    "timestamp": "Timestamp",
    "hash-generator": "Hash Gen",
    "regex-playground": "Regex",
    "color-palette": "Color Palette",
    "url-encoder": "URL Encoder",
    "text-diff": "Text Diff",
  };

  const topToolData = {
    labels: topTools.map((t) => toolNames[t._id] || t._id),
    datasets: [
      {
        label: "Usage Count",
        data: topTools.map((t) => t.count),
        backgroundColor: "#58a6ff", // accent-blue
        borderRadius: 4,
      },
    ],
  };

  const topToolOptions = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: { beginAtZero: true, ticks: { precision: 0, color: "#8b949e", font: { family: "JetBrains Mono", size: 10 } }, grid: { color: "#21262d" } },
      y: { ticks: { color: "#c9d1d9", font: { family: "Inter", size: 11 } }, grid: { color: "#21262d" } },
    },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-4 font-ui">
      <div className="gh-card p-4">
        <h2 className="text-xs font-mono font-bold text-gh-heading mb-3 pb-2 border-b border-gh-border">Weekly Activity</h2>
        <div className="h-56">
          {weeklyActivity.length > 0 && weeklyActivity.some(d => d.count > 0) ? (
            <Bar data={activityData} options={activityOptions} />
          ) : (
            <div className="h-full flex items-center justify-center text-xs font-mono text-gh-muted">No activity recorded in the last 7 days.</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="gh-card p-4">
          <h2 className="text-xs font-mono font-bold text-gh-heading mb-3 pb-2 border-b border-gh-border">Projects Status</h2>
          <div className="h-44">
            {projectsByStatus.length > 0 ? (
              <Doughnut data={projectData} options={projectOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-xs font-mono text-gh-muted">No projects found.</div>
            )}
          </div>
        </div>

        <div className="gh-card p-4">
          <h2 className="text-xs font-mono font-bold text-gh-heading mb-3 pb-2 border-b border-gh-border">Top Tools</h2>
          <div className="h-44">
            {topTools.length > 0 ? (
              <Bar data={topToolData} options={topToolOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-xs font-mono text-gh-muted">No tools used yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
