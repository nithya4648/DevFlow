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
    <div className="space-y-6 max-w-2xl font-ui">
      <div>
        <h2 className="text-base font-bold text-gh-heading font-mono flex items-center gap-2">
          <Settings className="h-5 w-5 text-accent-fg" />
          General Preferences & Sessions
        </h2>
        <p className="mt-0.5 text-xs text-gh-muted font-mono">
          Manage your general account settings and active sessions.
        </p>
      </div>

      {/* Active Sessions */}
      <div>
        <h3 className="text-xs font-mono font-bold text-gh-heading mb-2">Active Sessions</h3>
        <p className="text-xs text-gh-muted font-mono mb-3">
          List of devices that have logged into your account. Revoke any sessions you do not recognize.
        </p>

        {isLoadingSessions ? (
          <div className="flex justify-center py-4">
            <Loader className="h-5 w-5 animate-spin text-accent-fg" />
          </div>
        ) : (
          <div className="gh-card overflow-hidden">
            <ul className="divide-y divide-gh-border">
              {sessions.map((session) => (
                <li key={session.id} className="p-3.5 flex items-start justify-between">
                  <div className="flex items-start">
                    <div className="mt-0.5">
                      {session.userAgent.toLowerCase().includes("mobile") ? (
                        <Laptop className="h-5 w-5 text-gh-muted" />
                      ) : (
                        <Monitor className="h-5 w-5 text-gh-muted" />
                      )}
                    </div>
                    <div className="ml-3">
                      <h4 className="text-xs font-mono font-medium text-gh-heading flex items-center gap-2">
                        {session.userAgent}
                        {session.isCurrent && (
                          <span className="gh-badge text-[9px] font-mono uppercase">
                            Current Session
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] text-gh-muted font-mono mt-0.5">
                        IP Address: {session.ip}
                      </p>
                      <p className="text-[10px] text-gh-muted font-mono mt-0.5">
                        Last active: {new Date(session.lastActive).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRevokeSession(session.id)}
                    disabled={isRevoking}
                    className="ml-4 shrink-0 text-xs font-mono text-red-400 hover:text-red-300 disabled:opacity-50"
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
