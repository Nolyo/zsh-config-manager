import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getConfig, updateConfig, reloadZsh } from "../tauri";

export function useConfig(shared: boolean) {
  return useQuery({
    queryKey: ["config", shared],
    queryFn: () => getConfig(shared),
  });
}

export function useUpdateConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      content,
      shared,
    }: {
      content: string;
      shared: boolean;
    }) => updateConfig(content, shared),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["config", variables.shared] });
    },
  });
}

export function useReloadZsh() {
  return useMutation({
    mutationFn: () => reloadZsh(),
  });
}
