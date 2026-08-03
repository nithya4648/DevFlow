// frontend/src/hooks/useTeams.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { teamService } from "../services/team.service";

const TEAM_KEY = "teams";

export function useTeams() {
  return useQuery({
    queryKey: [TEAM_KEY],
    queryFn: teamService.getTeams,
    staleTime: 1000 * 60,
  });
}

/**
 * Returns the current user's role in a specific team.
 * @param {string|null} teamId  - the team the resource belongs to
 * @param {string} userId       - current authenticated user's _id
 * @returns {'admin'|'editor'|'viewer'|null}
 *   null  → resource is private (no team), user has full access
 *   admin / editor / viewer → role in that team
 */
export function useUserRole(teamId, userId) {
  const { data: teamsData } = useTeams();
  if (!teamId) return null; // private resource
  const teams = teamsData?.data || [];
  const team = teams.find((t) => t._id === teamId);
  if (!team) return "viewer"; // team exists but user not in it
  const member = team.members?.find((m) => (m.user?._id || m.user) === userId);
  return member?.role || "viewer";
}


export function useTeamDetails(id) {
  return useQuery({
    queryKey: [TEAM_KEY, "detail", id],
    queryFn: () => teamService.getTeamById(id),
    enabled: !!id,
  });
}

export function useTeamActivity(id) {
  return useQuery({
    queryKey: [TEAM_KEY, "activity", id],
    queryFn: () => teamService.getActivity(id),
    enabled: !!id,
  });
}

export function useCreateTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name) => teamService.createTeam(name),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TEAM_KEY] }),
  });
}

export function useInviteMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, email, role }) => teamService.inviteMember(id, email, role),
    onSuccess: (_, { id }) => qc.invalidateQueries({ queryKey: [TEAM_KEY, "detail", id] }),
  });
}

export function useChangeRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, userId, role }) => teamService.changeRole(id, userId, role),
    onSuccess: (_, { id }) => qc.invalidateQueries({ queryKey: [TEAM_KEY, "detail", id] }),
  });
}

export function useRemoveMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, userId }) => teamService.removeMember(id, userId),
    onSuccess: (_, { id }) => qc.invalidateQueries({ queryKey: [TEAM_KEY, "detail", id] }),
  });
}

export function useDeleteTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => teamService.deleteTeam(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TEAM_KEY] }),
  });
}
