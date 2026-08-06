// frontend/src/pages/InviteAcceptPage.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";
import useAuth from "../hooks/useAuth";

export default function InviteAcceptPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();

  // status: idle | loading | success | expired | already | error
  const [status, setStatus] = useState("idle");
  const [msg, setMsg] = useState("");

  const acceptInvite = async () => {
    setStatus("loading");
    try {
      // The axios interceptor attaches the stored JWT automatically
      const { data } = await api.get(`/invites/${token}/accept`);
      if (data.success !== false) {
        setStatus("success");
        setMsg("You've joined the team! Redirecting…");
        setTimeout(() => navigate("/teams"), 1800);
      } else {
        setStatus("error");
        setMsg(data.message || "Could not accept invite.");
      }
    } catch (err) {
      const code = err.response?.status;
      const serverMsg = err.response?.data?.message || err.response?.data || "";
      if (code === 410 || String(serverMsg).toLowerCase().includes("expired")) {
        setStatus("expired");
        setMsg("This invite link has expired.");
      } else if (String(serverMsg).toLowerCase().includes("already")) {
        setStatus("already");
        setMsg("You're already a member of this team.");
      } else if (code === 403 || String(serverMsg).toLowerCase().includes("wrong") || String(serverMsg).toLowerCase().includes("email")) {
        setStatus("error");
        setMsg("This invite was sent to a different email address. Please log in with the correct account.");
      } else {
        setStatus("error");
        setMsg(serverMsg || "Invalid or already-used invite link.");
      }
    }
  };

  useEffect(() => {
    if (authLoading) return; // wait until auth context has resolved

    if (!token) {
      setStatus("error");
      setMsg("Invalid invite link.");
      return;
    }

    if (user) {
      // Logged in — try to accept straight away
      acceptInvite();
    } else {
      // Not logged in — go to login, preserving this path so we return after auth
      navigate(
        `/login?inviteToken=${token}&redirect=${encodeURIComponent(location.pathname)}`,
        { replace: true }
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user, token]);

  // ── UI ──────────────────────────────────────────────────────────────
  const icon = {
    idle:    "⏳",
    loading: "⏳",
    success: "✅",
    expired: "⌛",
    already: "ℹ️",
    error:   "❌",
  }[status] ?? "⏳";

  const color = {
    success: "text-accent-fg",
    expired: "text-amber-400",
    already: "text-gh-muted",
    error:   "text-red-400",
  }[status] ?? "text-gh-muted";

  return (
    <div className="dark min-h-screen bg-gh-bg flex items-center justify-center px-4 font-ui text-gh-text">
      <div className="w-full max-w-sm gh-card p-8 text-center space-y-4">
        <div className="text-4xl">{icon}</div>
        <h1 className="text-base font-bold text-gh-heading font-mono">
          Team Invite
        </h1>
        {(status === "idle" || status === "loading") && (
          <p className="text-sm text-gh-muted font-mono animate-pulse">Processing your invite…</p>
        )}
        {status !== "idle" && status !== "loading" && (
          <p className={`text-sm font-mono ${color}`}>{msg}</p>
        )}
        {(status === "expired" || status === "error") && (
          <button
            onClick={() => navigate("/teams")}
            className="btn-secondary text-xs font-mono w-full justify-center"
          >
            Go to Teams
          </button>
        )}
        {status === "already" && (
          <button
            onClick={() => navigate("/teams")}
            className="btn-primary text-xs font-mono w-full justify-center"
          >
            View Teams
          </button>
        )}
      </div>
    </div>
  );
}
