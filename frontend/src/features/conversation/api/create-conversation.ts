import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from 'zod';
import { api } from '@/lib/api-client';
import { Conversation } from '@/types/api';
import Cookies from 'js-cookie';

export const createConversationInputSchema = z.object({
    title: z.string(),
});

export type CreateConversationInput = z.infer<typeof createConversationInputSchema>;

export const createConversationMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ data }: { data: CreateConversationInput }): Promise<Conversation> => {
            return api.post(`/conversations/`, data, { headers: { Authorization: `Token ${Cookies.get('token')}` } });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
        },
    });
}