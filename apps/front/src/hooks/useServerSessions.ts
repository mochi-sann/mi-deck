import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchClient } from '../lib/api/fetchClient';
import type { components } from '../lib/api/type';

type ServerSession = components['schemas']['models.ServerSession'];

export const useServerSessions = () => {
  const queryClient = useQueryClient();

  const { data: sessions, isLoading } = useQuery({
    queryKey: ['serverSessions'],
    queryFn: () => fetchClient<ServerSession[]>('/v1/server-sessions')
  });

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
