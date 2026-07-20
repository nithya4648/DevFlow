import useAuth from "../hooks/useAuth";
import { useToast } from "../context/ToastContext";
import { FaSignOutAlt, FaUserCircle } from "react-icons/fa";

function HomePage() {
  const { user, logout } = useAuth();
  const { addToast } = useToast();

  const handleLogout = async () => {
    await logout();
    addToast("Logged out successfully", "info");
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              DevFlow
            </span>
          </div>
          {user && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-8 w-8 rounded-full border border-indigo-500/30"
                  />
                ) : (
                  <FaUserCircle className="h-8 w-8 text-gray-400" />
                )}
                <span className="text-sm font-medium text-gray-300">{user.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-lg bg-gray-850 px-3.5 py-1.5 text-xs font-semibold text-gray-350 hover:bg-gray-800 hover:text-white transition"
              >
                <FaSignOutAlt />
                Log Out
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Panel */}
      <main className="mx-auto flex flex-grow max-w-4xl flex-col items-center justify-center px-4 py-12 text-center">
        <div className="rounded-3xl border border-gray-800 bg-gray-900/30 p-10 shadow-2xl backdrop-blur-xl max-w-lg">
          <h1 className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-4xl font-extrabold text-transparent">
            Welcome to DevFlow
          </h1>
          <p className="mt-4 text-gray-400">
            The Operating System for Developers
          </p>

          <div className="mt-8 rounded-2xl bg-gray-950/60 p-6 border border-gray-850 text-left space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-indigo-400">User Session Details</h3>
            <div className="grid grid-cols-3 gap-2 text-sm text-gray-400">
              <span className="font-medium text-gray-500">Name:</span>
              <span className="col-span-2 text-white">{user?.name}</span>
              
              <span className="font-medium text-gray-500">Email:</span>
              <span className="col-span-2 text-white">{user?.email}</span>
              
              <span className="font-medium text-gray-500">Role:</span>
              <span className="col-span-2 text-white capitalize">{user?.role}</span>
              
              <span className="font-medium text-gray-500">Verified:</span>
              <span className="col-span-2">
                {user?.isVerified ? (
                  <span className="rounded bg-green-500/10 px-2 py-0.5 text-xs font-semibold text-green-400 border border-green-500/20">Verified</span>
                ) : (
                  <span className="rounded bg-yellow-500/10 px-2 py-0.5 text-xs font-semibold text-yellow-400 border border-yellow-500/20">Unverified</span>
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
