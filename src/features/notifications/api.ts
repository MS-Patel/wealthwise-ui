import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Notification } from "@/types/notifications";
import { NOTIFICATION_FIXTURES } from "./fixtures";

/**
 * Mock notification layer. Swap fixtures for `api.get('/notifications/')`
 * to wire up DRF — query keys + return shapes stay identical.
 */

const NOTIF_KEY = ["notifications"] as const;
const LATENCY = 220;

let cache: Notification[] = [...NOTIFICATION_FIXTURES];

function delay<T>(value: T, ms = LATENCY): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export function useNotificationsQuery() {
  return useQuery({
    queryKey: NOTIF_KEY,
    queryFn: () => delay([...cache]),
    staleTime: 30_000,
  });
}

export function useUnreadCount(): number {
  const { data } = useNotificationsQuery();
  return data?.filter((n) => !n.read).length ?? 0;
}

export function useMarkAllReadMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      cache = cache.map((n) => ({ ...n, read: true }));
      return delay(cache);
    },
    onSuccess: (next) => qc.setQueryData(NOTIF_KEY, next),
  });
}

export function useMarkReadMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      cache = cache.map((n) => (n.id === id ? { ...n, read: true } : n));
      return delay(cache);
    },
    onSuccess: (next) => qc.setQueryData(NOTIF_KEY, next),
  });
}
