import { client } from "@/src/lib/amplify-client";
import { type Schema } from "@/amplify/data/resource";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useCreateToDo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: Schema["Todo"]["createType"]) => {
      return client.models.Todo.create(input);
    },
    onSuccess: (result) => {
      if (result.errors && result.errors.length > 0) {  
        // concatenate all error messages
        const errorMessages = result.errors.map((error) => error.message).join(", ");
        throw new Error(errorMessages);
      }

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
      
      if (errors && errors.length > 0 ) {
        console.error("Failed to fetch todo", errors);
        // concatenate all error messages
        const errorMessages = errors.map((error) => error.message).join(", ");
        throw new Error(errorMessages);
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
    onSuccess: (result, id) => {
      if (result.errors && result.errors.length > 0) {
        // concatenate all error messages
        const errorMessages = result.errors.map((error) => error.message).join(", ");
        throw new Error(errorMessages);
      }
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
      if (result.errors && result.errors.length > 0) {
        //concatenate all error messages
        const errorMessages = result.errors.map((error) => error.message).join(", ");
        throw new Error(errorMessages);
      }
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

export function useGetToDos() {
  return useQuery({
    queryKey: ['todos'],
    queryFn: async () => {
      const { data, errors } = await client.models.Todo.list();
      if (errors && errors.length > 0) {
        console.error("Failed to fetch todos", errors);
        throw new Error("Failed to fetch todos");
      }
      console.log("Fetched todos", data);
      return data;
    },
  });
}
