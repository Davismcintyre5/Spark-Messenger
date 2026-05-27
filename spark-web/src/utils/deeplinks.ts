import { api } from '@/services/api';

export async function resolveSparkToVibeLink(
  name: string,
  params: Record<string, string> = {},
): Promise<string | null> {
  try {
    const { data } = await api.get('/deeplinks/resolve', {
      params: { platform: 'spark', name, ...params },
    });
    return data?.data?.url || null;
  } catch {
    return null;
  }
}

export function openDeepLink(url: string): void {
  window.open(url, '_blank');
}

export function getVibeProfileLink(phone: string): string {
  return `vibe://profile?user=${encodeURIComponent(phone)}`;
}

export function getVibeExploreLink(): string {
  return 'vibe://explore';
}

export function postToVibeLink(content: string): string {
  return `vibe://create/post?text=${encodeURIComponent(content)}&from=spark`;
}