import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { api } from "@/lib/api-client";
import { Tool } from "@/types/api";
import Cookies from "js-cookie";
import { useToast } from "@/components/ui/toast/toast-provider";


export const updateToolInputSchema = z.object({
  toolId: z.string(),
  updates: z.object({
    name: z.string(),
    description: z.string(),
    script: z.string()
  }),
});

export type UpdateToolInput = z.infer<typeof updateToolInputSchema>;

type MutationContext = { toolId: string };

export const updateToolMutation = () => {
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  return useMutation<
    Tool,
    unknown,
    { data: UpdateToolInput },
    MutationContext
  >({
    mutationFn: async ({ data }) => {
      return api.put(`/tools/${data.toolId}/`, data.updates, {
        headers: { Authorization: `Token ${Cookies.get("token")}` },
      });
    },
    onMutate: async ({ data }) => {
      await queryClient.cancelQueries({ queryKey: ["tool", data.toolId] });
      return { toolId: data.toolId };
    },
    onSuccess: (_, __, context) => {
      addToast("Successfully updated tool!", "success")
      if (context) {
        queryClient.invalidateQueries({ queryKey: ["tool", context.toolId] });
        queryClient.invalidateQueries({ queryKey: ["tools"] });
      }
    },
    onError: (_, __, context) => {
      addToast("Failed to update tool!", "error");
      if (context) {
        queryClient.invalidateQueries({ queryKey: ["tool", context.toolId] });
      }
    },
  });
};
