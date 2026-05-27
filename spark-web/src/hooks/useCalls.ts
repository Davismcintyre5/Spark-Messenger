import { useQuery } from '@tanstack/react-query';
import { callService } from '@/services/callService';

export function useCallHistory(page: number = 1) {
  return useQuery({
    queryKey: ['calls', 'history', page],
    queryFn: () => callService.getHistory(page),
  });
}