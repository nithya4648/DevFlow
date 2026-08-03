import React, { useState } from "react";
import useAuth from "../../hooks/useAuth";
import { useToast } from "../../context/ToastContext";
import { userService } from "../../services/user.service";
import { Loader, AlertTriangle, ShieldCheck } from "lucide-react";

const SecurityTab = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);

    try {
      await userService.updatePassword({ currentPassword, newPassword });
      addToast("Password updated successfully", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update password");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user?.password && user?.googleId) {
    return (
      <div className="max-w-2xl font-ui">
        <div>
          <h2 className="text-base font-bold text-gh-heading font-mono">Security</h2>
          <p className="mt-0.5 text-xs text-gh-muted font-mono">
            Manage your account security and password.
          </p>
        </div>
        <div className="mt-5 bg-amber-500/10 border border-amber-500/20 rounded-md p-3.5 flex items-start">
          <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 mr-2.5 shrink-0" />
          <div>
            <h3 className="text-xs font-mono font-semibold text-amber-400">
              Google Authentication
            </h3>
            <p className="mt-0.5 text-xs text-amber-400/90 font-mono">
              You are logged in using Google. You cannot change your password here. Please manage your security settings through your Google account.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-2xl font-ui">
      <div>
        <h2 className="text-base font-bold text-gh-heading font-mono flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-accent-fg" />
          Security
        </h2>
        <p className="mt-0.5 text-xs text-gh-muted font-mono">
          Update your password to keep your account secure.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-md text-xs font-mono">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-mono font-medium text-gh-muted mb-1">
            Current Password
          </label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            className="gh-input text-xs font-mono w-full"
          />
        </div>

        <div>
          <label className="block text-xs font-mono font-medium text-gh-muted mb-1">
            New Password
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="gh-input text-xs font-mono w-full"
          />
          <p className="mt-1 text-[11px] text-gh-muted font-mono">
            Must be at least 6 characters long.
          </p>
        </div>

        <div>
          <label className="block text-xs font-mono font-medium text-gh-muted mb-1">
            Confirm New Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="gh-input text-xs font-mono w-full"
          />
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
            className="btn-primary text-xs font-mono"
          >
            {isLoading ? (
              <>
                <Loader className="animate-spin -ml-1 mr-2 h-3.5 w-3.5" />
                Updating...
              </>
            ) : (
              "Update Password"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SecurityTab;
