import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import type { Plugin } from "../types";

// Query to get enabled plugins
export function usePlugins() {
  return useQuery<Plugin[]>({
    queryKey: ["plugins"],
    queryFn: async () => {
      return await invoke<Plugin[]>("get_plugins");
    },
  });
}

// Query to get popular/available plugins
export function usePopularPlugins() {
  return useQuery<Plugin[]>({
    queryKey: ["plugins", "popular"],
    queryFn: async () => {
      return await invoke<Plugin[]>("get_popular_plugins");
    },
  });
}

// Mutation to add a plugin
export function useAddPlugin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pluginName: string) => {
      await invoke("add_plugin", { pluginName });
    },
    onSuccess: () => {
      // Invalidate both enabled and popular plugins
      queryClient.invalidateQueries({ queryKey: ["plugins"] });
    },
  });
}

// Mutation to remove a plugin
export function useRemovePlugin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pluginName: string) => {
      await invoke("remove_plugin", { pluginName });
    },
    onSuccess: () => {
      // Invalidate both enabled and popular plugins
      queryClient.invalidateQueries({ queryKey: ["plugins"] });
    },
  });
}
