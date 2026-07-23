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
        backgroundColor: "rgba(99, 102, 241, 0.8)", // indigo-500
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
      y: { beginAtZero: true, ticks: { precision: 0 } },
    },
  };

  // Chart 2: Projects by Status (Doughnut)
  const projectLabels = projectsByStatus.map((p) => p._id.charAt(0).toUpperCase() + p._id.slice(1));
  const projectCounts = projectsByStatus.map((p) => p.count);
  
  const statusColors = {
    "active": "rgba(99, 102, 241, 0.8)", // indigo
    "completed": "rgba(34, 197, 94, 0.8)", // green
    "archived": "rgba(107, 114, 128, 0.8)", // gray
    "planning": "rgba(234, 179, 8, 0.8)", // yellow
  };

  const projectData = {
    labels: projectLabels,
    datasets: [
      {
        data: projectCounts,
        backgroundColor: projectsByStatus.map(p => statusColors[p._id.toLowerCase()] || "rgba(148, 163, 184, 0.8)"),
        borderWidth: 1,
      },
    ],
  };

  const projectOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "right" },
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
        backgroundColor: "rgba(168, 85, 247, 0.8)", // purple-500
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
      x: { beginAtZero: true, ticks: { precision: 0 } },
    },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Weekly Activity</h3>
        <div className="h-64">
          {weeklyActivity.length > 0 && weeklyActivity.some(d => d.count > 0) ? (
            <Bar data={activityData} options={activityOptions} />
          ) : (
            <div className="h-full flex items-center justify-center text-sm text-gray-400">No activity in the last 7 days.</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Projects</h3>
          <div className="h-48">
            {projectsByStatus.length > 0 ? (
              <Doughnut data={projectData} options={projectOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-gray-400">No projects found.</div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Tools</h3>
          <div className="h-48">
            {topTools.length > 0 ? (
              <Bar data={topToolData} options={topToolOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-gray-400">No tools used yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
