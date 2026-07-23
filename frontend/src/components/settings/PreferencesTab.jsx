import React, { useState, useEffect } from "react";
import useAuth from "../../hooks/useAuth";
import { useToast } from "../../context/ToastContext";
import { userService } from "../../services/user.service";
import { Loader, Settings, Monitor, Laptop } from "lucide-react";

const PreferencesTab = () => {
  const { user, setUser } = useAuth();
  const { addToast } = useToast();
  
  const [sessions, setSessions] = useState([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [isRevoking, setIsRevoking] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const data = await userService.getSessions();
      setSessions(data.sessions);
    } catch (error) {
      addToast("Failed to fetch sessions", "error");
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const handleRevokeSession = async (id) => {
    if (!window.confirm("Are you sure you want to sign out of this session?")) return;
    
    setIsRevoking(true);
    try {
      await userService.revokeSession(id);
      addToast("Session revoked successfully", "success");
      if (id === "current") {
        // Will be redirected by AuthContext/Interceptor on next request or we can force it
        window.location.href = "/login";
      } else {
        setSessions(sessions.filter(s => s.id !== id));
      }
    } catch (error) {
      addToast(error.response?.data?.message || "Failed to revoke session", "error");
    } finally {
      setIsRevoking(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
          <Settings className="h-6 w-6 mr-2 text-indigo-500" />
          General Preferences & Sessions
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage your general account settings and active sessions.
        </p>
      </div>

      {/* Active Sessions */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Active Sessions</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          This is a list of devices that have logged into your account. Revoke any sessions that you do not recognize.
        </p>
        
        {isLoadingSessions ? (
          <div className="flex justify-center py-4">
            <Loader className="h-6 w-6 animate-spin text-indigo-500" />
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {sessions.map((session) => (
                <li key={session.id} className="p-4 flex items-start justify-between">
                  <div className="flex items-start">
                    <div className="mt-1">
                      {session.userAgent.toLowerCase().includes("mobile") ? (
                        <Laptop className="h-6 w-6 text-gray-400" /> // Using laptop as fallback for phone since phone might not be imported
                      ) : (
                        <Monitor className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                        {session.userAgent}
                        {session.isCurrent && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800">
                            Current Session
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        IP Address: {session.ip}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Last active: {new Date(session.lastActive).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRevokeSession(session.id)}
                    disabled={isRevoking}
                    className="ml-4 shrink-0 text-sm font-medium text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                  >
                    Revoke
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

    </div>
  );
};

export default PreferencesTab;
