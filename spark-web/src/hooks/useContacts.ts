import { useQuery } from '@tanstack/react-query';
import { contactService } from '@/services/contactService';

export function useContacts() {
  return useQuery({
    queryKey: ['contacts'],
    queryFn: () => contactService.getContacts(),
  });
}

export function useSearchContacts(query: string) {
  return useQuery({
    queryKey: ['contacts', 'search', query],
    queryFn: () => contactService.searchContacts(query),
    enabled: query.length >= 2,
  });
}