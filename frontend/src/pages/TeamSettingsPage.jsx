// frontend/src/pages/TeamSettingsPage.jsx
import { useState, useEffect } from "react";
import { useTeams, useCreateTeam, useTeamDetails, useInviteMember, useChangeRole, useRemoveMember, useDeleteTeam } from "../hooks/useTeams";
import useAuth from "../hooks/useAuth";

export default function TeamSettingsPage() {
  const { user } = useAuth();
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [teamNameInput, setTeamNameInput] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("viewer");
  const [inviteMessage, setInviteMessage] = useState(null);

  const { data: teamsRes, isLoading: teamsLoading } = useTeams();
  const teams = teamsRes?.data || [];

  const { data: detailsRes, isLoading: detailsLoading } = useTeamDetails(selectedTeamId);
  const activeTeam = detailsRes?.data || null;

  const createTeamMutation = useCreateTeam();
  const inviteMutation = useInviteMember();
  const changeRoleMutation = useChangeRole();
  const removeMemberMutation = useRemoveMember();
  const deleteTeamMutation = useDeleteTeam();

  // Auto-select first team after teams load, if none is already selected
  useEffect(() => {
    if (teams.length > 0 && !selectedTeamId) {
      setSelectedTeamId(teams[0]._id);
    }
  }, [teams, selectedTeamId]);

  function handleCreateTeam(e) {
    e.preventDefault();
    if (!teamNameInput.trim()) return;
    createTeamMutation.mutate(teamNameInput, {
      onSuccess: (res) => {
        setTeamNameInput("");
        setSelectedTeamId(res.data._id);
      },
    });
  }

  function handleInvite(e) {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviteMessage(null);
    inviteMutation.mutate(
      { id: selectedTeamId, email: inviteEmail, role: inviteRole },
      {
        onSuccess: () => {
          setInviteEmail("");
          setInviteMessage({ type: "success", text: "Member invited successfully!" });
        },
        onError: (err) => {
          const status = err.response?.status;
          const msg = err.response?.data?.message || err.message || "";
          if (status === 404 || msg.toLowerCase().includes("not found")) {
            setInviteMessage({
              type: "error",
              text: "This email hasn't signed up for DevFlow yet. They need to create an account before you can add them to a team.",
            });
          } else {
            setInviteMessage({ type: "error", text: msg || "Failed to send invitation." });
          }
        },
      }
    );
  }

  function handleRoleChange(memberUserId, newRole) {
    changeRoleMutation.mutate({ id: selectedTeamId, userId: memberUserId, role: newRole });
  }

  function handleRemove(memberUserId) {
    if (window.confirm("Remove this member from the team?")) {
      removeMemberMutation.mutate({ id: selectedTeamId, userId: memberUserId });
    }
  }

  function handleDeleteTeam() {
    if (!activeTeam) return;
    const promptVal = window.prompt(
      `To confirm deletion of team "${activeTeam.name}", please type "${activeTeam.name}" below:`
    );
    if (promptVal === activeTeam.name) {
      deleteTeamMutation.mutate(selectedTeamId, {
        onSuccess: () => {
          setSelectedTeamId(null);
          setInviteMessage(null);
        },
        onError: (err) => {
          alert(`Error deleting team: ${err.response?.data?.message || err.message}`);
        },
      });
    } else if (promptVal !== null) {
      alert("Team name mismatch. Deletion cancelled.");
    }
  }

  const currentUserRole = activeTeam?.members?.find(m => m.user?._id === user?._id)?.role || "viewer";
  const isAdmin = currentUserRole === "admin";
  const isOwner = (activeTeam?.owner?._id || activeTeam?.owner) === user?._id;

  return (
    <div className="flex-1 flex flex-col md:flex-row gap-6 max-w-7xl mx-auto w-full px-6 py-6 h-full min-h-0 font-ui">

      {/* Left panel: Team list / Creator */}
      <div className="w-full md:w-56 shrink-0 flex flex-col gap-4 border-r border-gh-border pr-4">
        <div>
          <h2 className="text-sm font-bold text-gh-heading font-mono">My Teams</h2>
          <p className="text-xs text-gh-muted font-mono">Select or create a workspace</p>
        </div>

        {/* Create Team Form */}
        <form onSubmit={handleCreateTeam} className="space-y-2">
          <input
            type="text"
            placeholder="New team name..."
            value={teamNameInput}
            onChange={(e) => setTeamNameInput(e.target.value)}
            className="gh-input text-xs font-mono w-full"
          />
          <button
            type="submit"
            disabled={createTeamMutation.isPending}
            className="btn-primary text-xs font-mono w-full justify-center"
          >
            Create Team
          </button>
        </form>

        {/* Team list */}
        <div className="flex-1 overflow-y-auto space-y-1">
          {teamsLoading ? (
            <p className="text-xs text-gh-muted font-mono">Loading teams...</p>
          ) : teams.length === 0 ? (
            <p className="text-xs text-gh-muted font-mono italic">No teams created.</p>
          ) : (
            teams.map((t) => (
              <button
                key={t._id}
                onClick={() => {
                  setSelectedTeamId(t._id);
                  setInviteMessage(null);
                }}
                className={`w-full text-left px-3 py-2 rounded-md text-xs font-mono transition-colors ${
                  selectedTeamId === t._id
                    ? "bg-accent-light text-accent-fg border border-accent-border font-semibold"
                    : "text-gh-text hover:text-gh-heading hover:bg-gh-subtle border border-transparent"
                }`}
              >
                👥 {t.name}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right panel: Members list / settings */}
      <div className="flex-1 flex flex-col min-w-0 gh-card p-5 relative">
        {detailsLoading ? (
          <p className="text-xs text-gh-muted font-mono">Loading team details...</p>
        ) : !activeTeam ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <span className="text-3xl mb-2">👥</span>
            <h3 className="text-sm font-bold text-gh-heading font-mono">Select or Create a Team</h3>
            <p className="text-xs text-gh-muted font-mono mt-1">Join workspace to collaborate with editing/viewing privileges.</p>
          </div>
        ) : (
          <div className="flex flex-col h-full min-h-0 space-y-5">

            {/* Header */}
            <div className="border-b border-gh-border pb-3 flex items-center justify-between gap-4">
              <div>
                <h1 className="text-lg font-bold text-gh-heading font-mono">{activeTeam.name}</h1>
                <p className="text-xs text-gh-muted font-mono mt-0.5">
                  Role: <span className="uppercase font-semibold text-accent-fg">{currentUserRole}</span>
                  {isOwner && <span className="ml-2 text-[10px] bg-amber-500/10 border border-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded uppercase">Owner</span>}
                </p>
              </div>

              {isOwner && (
                <button
                  onClick={handleDeleteTeam}
                  disabled={deleteTeamMutation.isPending}
                  className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded text-xs font-mono transition-colors shrink-0 flex items-center gap-1.5"
                  title="Delete Team"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  {deleteTeamMutation.isPending ? "Deleting..." : "Delete Team"}
                </button>
              )}
            </div>

            {/* Invite Form (Admins only) */}
            {isAdmin && (
              <div className="bg-gh-subtle border border-gh-border p-4 rounded-md space-y-3">
                <h3 className="text-xs font-mono font-semibold text-gh-heading">Invite Team Member</h3>
                <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    placeholder="Enter email address..."
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                    className="gh-input text-xs font-mono flex-1"
                  />
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="gh-input text-xs font-mono"
                  >
                    <option value="viewer" className="bg-gh-surface">Viewer (Read-only)</option>
                    <option value="editor" className="bg-gh-surface">Editor (Can edit)</option>
                    <option value="admin" className="bg-gh-surface">Admin (Can invite)</option>
                  </select>
                  <button
                    type="submit"
                    disabled={inviteMutation.isPending}
                    className="btn-primary text-xs font-mono shrink-0"
                  >
                    {inviteMutation.isPending ? "Inviting..." : "Invite"}
                  </button>
                </form>

                {inviteMessage && (
                  <div
                    className={`p-2.5 rounded-md text-xs font-mono border ${
                      inviteMessage.type === "success"
                        ? "bg-accent-light border-accent-border text-accent-fg"
                        : "bg-red-500/10 border-red-500/20 text-red-400"
                    }`}
                  >
                    {inviteMessage.text}
                  </div>
                )}
              </div>
            )}

            {/* Members table */}
            <div className="flex-1 min-h-0 overflow-y-auto">
              <h3 className="text-xs font-mono font-semibold text-gh-heading mb-2.5">Workspace Members</h3>
              <div className="bg-gh-bg border border-gh-border rounded-md overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-gh-border bg-gh-subtle text-gh-muted font-mono font-semibold">
                      <th className="px-3 py-2">Name</th>
                      <th className="px-3 py-2">Email</th>
                      <th className="px-3 py-2">Role</th>
                      {isAdmin && <th className="px-3 py-2 text-right">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gh-border font-mono">
                    {activeTeam.members?.map((member) => (
                      <tr key={member.user?._id} className="hover:bg-gh-subtle transition-colors">
                        <td className="px-3 py-2 font-medium text-gh-heading flex items-center gap-2">
                          {member.user?.avatar ? (
                            <img src={member.user.avatar} alt="avatar" className="w-5 h-5 rounded-full" />
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-gh-border flex items-center justify-center text-[10px]">
                              👤
                            </div>
                          )}
                          {member.user?.name}
                        </td>
                        <td className="px-3 py-2 text-gh-muted">{member.user?.email}</td>
                        <td className="px-3 py-2">
                          {isAdmin && member.user?._id !== activeTeam.owner ? (
                            <select
                              value={member.role}
                              onChange={(e) => handleRoleChange(member.user._id, e.target.value)}
                              className="gh-input text-xs py-0.5 px-1.5"
                            >
                              <option value="viewer" className="bg-gh-surface">Viewer</option>
                              <option value="editor" className="bg-gh-surface">Editor</option>
                              <option value="admin" className="bg-gh-surface">Admin</option>
                            </select>
                          ) : (
                            <span className="uppercase font-semibold px-1.5 py-0.5 rounded bg-gh-subtle border border-gh-border text-gh-muted text-[10px]">
                              {member.role}
                            </span>
                          )}
                        </td>
                        {isAdmin && (
                          <td className="px-3 py-2 text-right">
                            {member.user?._id !== activeTeam.owner && (
                              <button
                                onClick={() => handleRemove(member.user._id)}
                                className="px-2 py-0.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded text-[11px] transition-colors"
                              >
                                Remove
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
