import React, { useState } from "react";
import ProfileTab from "../components/settings/ProfileTab";
import AppearanceTab from "../components/settings/AppearanceTab";
import SecurityTab from "../components/settings/SecurityTab";
import ApiKeysTab from "../components/settings/ApiKeysTab";
import PreferencesTab from "../components/settings/PreferencesTab";

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("profile");

  const tabs = [
    { id: "profile", label: "Profile" },
    { id: "appearance", label: "Appearance" },
    { id: "security", label: "Security" },
    { id: "api-keys", label: "API Keys" },
    { id: "preferences", label: "Preferences" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return <ProfileTab />;
      case "appearance":
        return <AppearanceTab />;
      case "security":
        return <SecurityTab />;
      case "api-keys":
        return <ApiKeysTab />;
      case "preferences":
        return <PreferencesTab />;
      default:
        return <ProfileTab />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 font-ui">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-gh-heading font-mono">Settings</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <aside className="w-full md:w-56 shrink-0">
          <nav className="flex space-x-1 md:flex-col md:space-x-0 md:space-y-0.5 overflow-x-auto pb-2 md:pb-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`shrink-0 px-3 py-2 text-xs font-mono font-medium rounded-md transition-colors ${
                  activeTab === tab.id
                    ? "bg-accent-light text-accent-fg border border-accent-border font-semibold"
                    : "text-gh-text hover:bg-gh-subtle hover:text-gh-heading border border-transparent"
                } md:justify-start text-left`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content Area */}
        <div className="flex-1 gh-card p-6 min-h-[500px]">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
