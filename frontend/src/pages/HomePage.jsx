import useAuth from "../hooks/useAuth";
import { useToast } from "../context/ToastContext";
import { FaSignOutAlt, FaUserCircle, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

function HomePage() {
  const { user, logout } = useAuth();
  const { addToast } = useToast();

  const handleLogout = async () => {
    await logout();
    addToast("Logged out successfully", "info");
  };

  return (
    <div className="flex min-h-screen flex-col bg-gh-bg text-gh-text font-ui">
      {/* Header Bar */}
      <header className="border-b border-gh-border bg-gh-surface px-6 py-3">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold font-mono tracking-tight text-gh-heading">
              DevFlow
            </span>
            <span className="gh-badge-accent">v1.0</span>
          </div>

          {user && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-7 w-7 rounded-full border border-gh-border object-cover"
                  />
                ) : (
                  <FaUserCircle className="h-6 w-6 text-gh-muted" />
                )}
                <span className="text-sm font-medium text-gh-text">{user.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="btn-secondary text-xs py-1 px-2.5"
              >
                <FaSignOutAlt className="text-xs" />
                Log Out
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto flex flex-grow max-w-3xl flex-col items-center justify-center px-4 py-12">
        <div className="w-full gh-card max-w-lg space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gh-heading">
              Welcome to DevFlow
            </h1>
            <p className="mt-1 text-sm text-gh-muted font-mono">
              Developer Workstation & Operations OS
            </p>
          </div>

          {/* User Session Details */}
          <div className="rounded-md bg-gh-bg p-4 border border-gh-border space-y-3">
            <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-gh-muted">
              User Session Details
            </h2>
            
            <div className="grid grid-cols-3 gap-y-2 text-sm">
              <span className="font-mono text-xs text-gh-muted">Name:</span>
              <span className="col-span-2 font-medium text-gh-heading">{user?.name || "N/A"}</span>
              
              <span className="font-mono text-xs text-gh-muted">Email:</span>
              <span className="col-span-2 font-mono text-xs text-gh-text">{user?.email || "N/A"}</span>
              
              <span className="font-mono text-xs text-gh-muted">Role:</span>
              <span className="col-span-2 capitalize font-medium text-gh-text">{user?.role || "user"}</span>
              
              <span className="font-mono text-xs text-gh-muted">Status:</span>
              <span className="col-span-2">
                {user?.isVerified ? (
                  <span className="gh-badge-accent">
                    <FaCheckCircle className="text-[10px]" /> Verified
                  </span>
                ) : (
                  <span className="gh-badge">
                    <FaExclamationCircle className="text-[10px] text-amber-400" /> Unverified
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default HomePage;
