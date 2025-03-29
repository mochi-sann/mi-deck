import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { $api, fetchClient } from '../lib/api/fetchClient';
import type { components } from '../lib/api/type';

type ServerSession = components['schemas']['models.ServerSession'];

export const useServerSessions = () => {
  const queryClient = useQueryClient();

  const { data: sessions, isLoading } = $api.useQuery("get" , "/v1/auth/me");

  const createMutation = useMutation({
    mutationFn: (data: { origin: string; serverType: string }) => 
      fetchClient<ServerSession>('/v1/server-sessions', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serverSessions'] });
    }
  });

  return {
    sessions,
    isLoading,
    createSession: createMutation.mutateAsync
  };
};
