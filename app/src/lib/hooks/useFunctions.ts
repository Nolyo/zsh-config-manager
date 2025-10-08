import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addFunction, deleteFunction, listFunctions, updateFunction } from "../tauri";

export function useFunctions(shared: boolean) {
  return useQuery({
    queryKey: ["functions", shared],
    queryFn: () => listFunctions(shared),
  });
}

export function useAddFunction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      name,
      content,
      shared,
    }: {
      name: string;
      content: string;
      shared: boolean;
    }) => addFunction(name, content, shared),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["functions", variables.shared] });
    },
  });
}

export function useUpdateFunction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      name,
      content,
      shared,
    }: {
      name: string;
      content: string;
      shared: boolean;
    }) => updateFunction(name, content, shared),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["functions", variables.shared] });
    },
  });
}

export function useDeleteFunction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ name, shared }: { name: string; shared: boolean }) =>
      deleteFunction(name, shared),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["functions", variables.shared] });
    },
  });
}
