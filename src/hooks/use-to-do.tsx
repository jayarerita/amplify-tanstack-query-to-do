import { client } from "@/src/lib/amplify-client";
import { type Schema } from "@/amplify/data/resource";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useCreateToDo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: Schema["Todo"]["createType"]) => {
      return client.models.Todo.create(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      
    },
    onError: (error) => {
      console.error(error);
    },
  });
}

export function useGetToDo(id: string) {
  return useQuery({
    queryKey: ['todo', id],
    queryFn: async () => {
      const { data, errors } = await client.models.Todo.get(
        { id }
      );
      
      if (errors) {
        console.error("Failed to fetch todo", errors);
        throw new Error(errors[0]?.message || "Failed to fetch todo");
      }
      
      if (!data) {
        throw new Error("Todo not found");
      }
      
      return data;
    },
    enabled: !!id,
  });
}

export function useDeleteToDo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return client.models.Todo.delete({ id });
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      queryClient.invalidateQueries({ queryKey: ['todo', id] });
      
    },
    onError: (error) => {
      console.error(error);
    },
  });
}

export function useUpdateToDo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: Schema["Todo"]["updateType"]) => {
      return client.models.Todo.update(input);
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      if (result.data?.id) {
        queryClient.invalidateQueries({ queryKey: ['todo', result.data.id] });
      }

    },
    onError: (error) => {
      console.error(error);
    },
  });
}

export function useGetToDos(options?: { nextToken?: string }) {

  return useQuery({
    queryKey: ['todos', options?.nextToken],
    queryFn: async () => {
      const result = await client.models.Todo.list({
        limit: 100,
        nextToken: options?.nextToken,
      });

      // console.log("list bowel movements result", result);
      
      if (result.errors) {
        console.error("Failed to fetch todos", result.errors);
        throw new Error("Failed to fetch todos");
      }
      
      
      return {
        items: result.data,
        nextToken: result.nextToken
      };
    },
  });
}