import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { gitStatus, gitPull, gitPush, gitCommit, gitLog, gitDiff, gitInit } from "../tauri";

export function useGitStatus() {
  return useQuery({
    queryKey: ["git", "status"],
    queryFn: () => gitStatus(),
    refetchInterval: 5000, // Auto-refresh every 5 seconds
  });
}

export function useGitPull() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => gitPull(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["git", "status"] });
      queryClient.invalidateQueries({ queryKey: ["git", "log"] });
    },
  });
}

export function useGitPush() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => gitPush(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["git", "status"] });
    },
  });
}

export function useGitCommit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (message: string) => gitCommit(message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["git", "status"] });
      queryClient.invalidateQueries({ queryKey: ["git", "log"] });
    },
  });
}

export function useGitLog(limit: number = 20) {
  return useQuery({
    queryKey: ["git", "log", limit],
    queryFn: () => gitLog(limit),
  });
}

export function useGitDiff() {
  return useQuery({
    queryKey: ["git", "diff"],
    queryFn: () => gitDiff(),
    enabled: false, // Only fetch when explicitly requested
  });
}

export function useGitInit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => gitInit(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["git"] });
    },
  });
}
