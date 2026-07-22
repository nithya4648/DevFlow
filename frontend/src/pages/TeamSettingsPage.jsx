// frontend/src/pages/TeamSettingsPage.jsx
import { useState } from "react";
import { useTeams, useCreateTeam, useTeamDetails, useInviteMember, useChangeRole, useRemoveMember } from "../hooks/useTeams";
import useAuth from "../hooks/useAuth";

export default function TeamSettingsPage() {
  const { user } = useAuth();
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [teamNameInput, setTeamNameInput] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("viewer");

  const { data: teamsRes, isLoading: teamsLoading } = useTeams();
  const teams = teamsRes?.data || [];

  const { data: detailsRes, isLoading: detailsLoading } = useTeamDetails(selectedTeamId);
  const activeTeam = detailsRes?.data || null;

  const createTeamMutation = useCreateTeam();
  const inviteMutation = useInviteMember();
  const changeRoleMutation = useChangeRole();
  const removeMemberMutation = useRemoveMember();

  // Pick first team automatically if none selected
  if (teams.length > 0 && !selectedTeamId) {
    setSelectedTeamId(teams[0]._id);
  }

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
    inviteMutation.mutate(
      { id: selectedTeamId, email: inviteEmail, role: inviteRole },
      {
        onSuccess: () => {
          setInviteEmail("");
          alert("Member invited successfully!");
        },
        onError: (err) => {
          alert(`Error: ${err.response?.data?.message || err.message}`);
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

  const currentUserRole = activeTeam?.members?.find(m => m.user?._id === user?._id)?.role || "viewer";
  const isAdmin = currentUserRole === "admin";

  return (
    <div className="flex-1 flex flex-col md:flex-row gap-6 max-w-7xl mx-auto w-full px-6 py-6 h-full min-h-0">
      
      {/* Left panel: Team list / Creator */}
      <div className="w-full md:w-64 shrink-0 flex flex-col gap-4 border-r border-white/5 pr-4">
        <div>
          <h2 className="text-base font-bold text-gray-100 mb-2">My Teams</h2>
          <p className="text-xs text-gray-500">Select or create a workspace</p>
        </div>

        {/* Create Team Form */}
        <form onSubmit={handleCreateTeam} className="space-y-2">
          <input
            type="text"
            placeholder="New team name..."
            value={teamNameInput}
            onChange={(e) => setTeamNameInput(e.target.value)}
            className="w-full bg-gray-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition"
          />
          <button
            type="submit"
            disabled={createTeamMutation.isPending}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition"
          >
            Create Team
          </button>
        </form>

        {/* Team list */}
        <div className="flex-1 overflow-y-auto space-y-1">
          {teamsLoading ? (
            <p className="text-xs text-gray-500">Loading teams...</p>
          ) : teams.length === 0 ? (
            <p className="text-xs text-gray-500 italic">No teams created.</p>
          ) : (
            teams.map((t) => (
              <button
                key={t._id}
                onClick={() => setSelectedTeamId(t._id)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs transition-all ${
                  selectedTeamId === t._id
                    ? "bg-indigo-500/20 text-indigo-400 font-semibold border border-indigo-500/30"
                    : "text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent"
                }`}
              >
                👥 {t.name}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right panel: Members list / settings */}
      <div className="flex-1 flex flex-col min-w-0 bg-gray-950/40 border border-white/5 rounded-2xl p-6 relative">
        {detailsLoading ? (
          <p className="text-xs text-gray-500">Loading team details...</p>
        ) : !activeTeam ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <span className="text-4xl mb-3">👥</span>
            <h3 className="text-sm font-semibold text-gray-300">Select or Create a Team</h3>
            <p className="text-xs text-gray-500 mt-1">Join workspace to collaborate with editing/viewing privileges.</p>
          </div>
        ) : (
          <div className="flex flex-col h-full min-h-0 space-y-6">
            
            {/* Header */}
            <div className="border-b border-white/5 pb-4">
              <h1 className="text-xl font-bold text-gray-100">{activeTeam.name}</h1>
              <p className="text-xs text-gray-500 mt-1">
                Role: <span className="uppercase font-semibold text-indigo-400">{currentUserRole}</span>
              </p>
            </div>

            {/* Invite Form (Admins only) */}
            {isAdmin && (
              <div className="bg-white/3 border border-white/5 p-4 rounded-xl">
                <h3 className="text-xs font-semibold text-gray-200 mb-3">Invite Team Member</h3>
                <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    placeholder="Enter email address..."
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                    className="flex-1 bg-gray-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition"
                  />
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="bg-gray-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition"
                  >
                    <option value="viewer">Viewer (Read-only)</option>
                    <option value="editor">Editor (Can edit)</option>
                    <option value="admin">Admin (Can invite)</option>
                  </select>
                  <button
                    type="submit"
                    disabled={inviteMutation.isPending}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-50 text-white text-xs font-semibold rounded-xl transition"
                  >
                    Invite
                  </button>
                </form>
              </div>
            )}

            {/* Members table */}
            <div className="flex-1 min-h-0 overflow-y-auto">
              <h3 className="text-xs font-semibold text-gray-200 mb-3">Workspace Members</h3>
              <div className="bg-gray-900/50 border border-white/5 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5 text-gray-400 font-semibold">
                      <th className="px-4 py-2.5">Name</th>
                      <th className="px-4 py-2.5">Email</th>
                      <th className="px-4 py-2.5">Role</th>
                      {isAdmin && <th className="px-4 py-2.5 text-right">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {activeTeam.members?.map((member) => (
                      <tr key={member.user?._id} className="hover:bg-white/5 transition">
                        <td className="px-4 py-2.5 font-medium text-gray-200 flex items-center gap-2">
                          {member.user?.avatar ? (
                            <img src={member.user.avatar} alt="avatar" className="w-5 h-5 rounded-full" />
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-gray-700 flex items-center justify-center text-[10px]">
                              👤
                            </div>
                          )}
                          {member.user?.name}
                        </td>
                        <td className="px-4 py-2.5 text-gray-400">{member.user?.email}</td>
                        <td className="px-4 py-2.5">
                          {isAdmin && member.user?._id !== activeTeam.owner ? (
                            <select
                              value={member.role}
                              onChange={(e) => handleRoleChange(member.user._id, e.target.value)}
                              className="bg-gray-800 border border-white/10 rounded px-2 py-1 text-xs text-gray-200"
                            >
                              <option value="viewer">Viewer</option>
                              <option value="editor">Editor</option>
                              <option value="admin">Admin</option>
                            </select>
                          ) : (
                            <span className="uppercase font-semibold px-2 py-0.5 rounded bg-white/5 border border-white/10 text-gray-400 text-[10px]">
                              {member.role}
                            </span>
                          )}
                        </td>
                        {isAdmin && (
                          <td className="px-4 py-2.5 text-right">
                            {member.user?._id !== activeTeam.owner && (
                              <button
                                onClick={() => handleRemove(member.user._id)}
                                className="px-2 py-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded transition"
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
