import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addAlias, deleteAlias, listAliases, updateAlias, listSecretsAliases } from "../tauri";

export function useAliases(shared: boolean) {
  return useQuery({
    queryKey: ["aliases", shared],
    queryFn: () => listAliases(shared),
  });
}

export function useAddAlias() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      name,
      command,
      shared,
    }: {
      name: string;
      command: string;
      shared: boolean;
    }) => addAlias(name, command, shared),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["aliases", variables.shared] });
    },
  });
}

export function useUpdateAlias() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      oldName,
      newName,
      command,
      shared,
    }: {
      oldName: string;
      newName: string;
      command: string;
      shared: boolean;
    }) => updateAlias(oldName, newName, command, shared),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["aliases", variables.shared] });
    },
  });
}

export function useDeleteAlias() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ name, shared }: { name: string; shared: boolean }) =>
      deleteAlias(name, shared),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["aliases", variables.shared] });
    },
  });
}

export function useSecretsAliases() {
  return useQuery({
    queryKey: ["aliases", "secrets"],
    queryFn: () => listSecretsAliases(),
  });
}
