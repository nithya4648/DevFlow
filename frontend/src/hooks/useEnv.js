// frontend/src/hooks/useEnv.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { envService } from "../services/env.service";

const ENV_KEY = "env-vars";

export function useEnvVars(filters = {}) {
  return useQuery({
    queryKey: [ENV_KEY, filters],
    queryFn: () => envService.getEnvVars(filters),
    staleTime: 1000 * 30,
  });
}

export function useCreateEnvVar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => envService.createEnvVar(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [ENV_KEY] }),
  });
}

export function useUpdateEnvVar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => envService.updateEnvVar(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [ENV_KEY] }),
  });
}

export function useDeleteEnvVar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => envService.deleteEnvVar(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [ENV_KEY] }),
  });
}
