// frontend/src/hooks/useTeams.js
import { useMutation } from "@tanstack/react-query";

/**
 * Stub hook returning an empty list of teams.
 */
export function useTeams() {
  return {
    data: { data: [] },
    isLoading: false,
    error: null,
  };
}

export function useUserRole() {
  return null;
}

export function useTeamDetails() {
  return { data: null, isLoading: false, error: null };
}

export function useTeamActivity() {
  return { data: null, isLoading: false, error: null };
}

export function useCreateTeam() {
  return useMutation(() => Promise.resolve());
}

export function useInviteMember() {
  return useMutation(() => Promise.resolve());
}

export function useChangeRole() {
  return useMutation(() => Promise.resolve());
}

export function useRemoveMember() {
  return useMutation(() => Promise.resolve());
}

export function useDeleteTeam() {
  return useMutation(() => Promise.resolve());
}

export function useRenameTeam() {
  return useMutation(() => Promise.resolve());
}

export function useGenerateInviteLink() {
  return useMutation(() => Promise.resolve());
}
