import { useQuery } from "@tanstack/react-query";
import { api } from '@/lib/api-client';
import { Model } from '@/types/api';
import Cookies from 'js-cookie';

export const useGetModelsQuery = () => {
    return useQuery({
        queryFn: (): Promise<Model[]> => {
            return api.get(`/models/`, {
                headers: { Authorization: `Token ${Cookies.get('token')}` }
            });
        },
        queryKey: ["models"],
        staleTime: 1000 * 60 * 0.25,
    });
}