// frontend/src/hooks/useProjects.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectService } from "../services/project.service";

const PROJECT_KEY = "projects";

export function useProjects(filters = {}) {
  return useQuery({
    queryKey: [PROJECT_KEY, filters],
    queryFn: () => projectService.getProjects(filters),
    staleTime: 1000 * 30, // 30s
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => projectService.createProject(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PROJECT_KEY] }),
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => projectService.updateProject(id, data),
    // Optimistic update
    onMutate: async ({ id, data }) => {
      await qc.cancelQueries({ queryKey: [PROJECT_KEY] });
      const prev = qc.getQueriesData({ queryKey: [PROJECT_KEY] });
      qc.setQueriesData({ queryKey: [PROJECT_KEY] }, (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((p) => (p._id === id ? { ...p, ...data } : p)),
        };
      });
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) {
        ctx.prev.forEach(([key, val]) => qc.setQueryData(key, val));
      }
    },
    onSettled: () => qc.invalidateQueries({ queryKey: [PROJECT_KEY] }),
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => projectService.deleteProject(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PROJECT_KEY] }),
  });
}
