import { QueryClient } from '@tanstack/react-query';
import { fetchExerciseById, fetchExercises } from './exerciseApi';

/**
 * Global QueryClient with 5-minute staleTime and 15-minute garbage collection time.
 * Revisiting any route or exercise renders cached data instantly (0ms TTFB).
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 15 * 60 * 1000,    // 15 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const exerciseQueryKeys = {
  all: ['exercises'] as const,
  list: (filters: { q?: string; bodyPart?: string }) =>
    ['exercises', 'list', filters.q || '', filters.bodyPart || 'all'] as const,
  detail: (id: string) => ['exercises', 'detail', id] as const,
};

/**
 * Route Chunk Prefetchers
 * Warms the client view modules ahead of navigation
 */
const routeChunkLoaders: Record<string, () => Promise<unknown>> = {
  '/': () => import('../components/views/MainView'),
  '/workouts': () => import('../components/views/WorkoutsView'),
  '/timer': () => import('../components/views/TimerView'),
  '/dashboard': () => import('../components/views/DashboardView'),
};

const prefetchedRoutes = new Set<string>();

export function prefetchRouteChunk(path: string) {
  if (prefetchedRoutes.has(path)) return;
  const loader = routeChunkLoaders[path];
  if (loader) {
    prefetchedRoutes.add(path);
    loader().catch(() => {
      prefetchedRoutes.delete(path);
    });
  }
}

/**
 * Prefetch exercise list into TanStack Query cache
 */
export async function prefetchExercisesData(filters: { q?: string; bodyPart?: string } = {}) {
  await queryClient.prefetchQuery({
    queryKey: exerciseQueryKeys.list(filters),
    queryFn: () => fetchExercises(filters),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Prefetch single exercise by ID into TanStack Query cache
 */
export async function prefetchExerciseDetail(id: string) {
  if (!id) return;
  await queryClient.prefetchQuery({
    queryKey: exerciseQueryKeys.detail(id),
    queryFn: () => fetchExerciseById(id),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Prefetch GIF animation media ahead of user opening details
 */
export function prefetchAnimationMedia(id: string) {
  if (typeof window === 'undefined' || !id) return;
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.as = 'image';
  link.href = `/api/exercises/animation?id=${encodeURIComponent(id)}`;
  document.head.appendChild(link);
}

/**
 * Schedule non-blocking idle prefetching of key routes & assets
 */
export function scheduleIdlePrefetch() {
  if (typeof window === 'undefined') return;

  const runPrefetch = () => {
    // 1. Prefetch lazy route chunks
    prefetchRouteChunk('/workouts');
    prefetchRouteChunk('/timer');
    prefetchRouteChunk('/dashboard');

    // 2. Prefetch default routine exercises in parallel
    const defaultIds = [
      'db-bench-press',
      'db-bent-over-row',
      'db-overhead-press',
      'db-bicep-curl',
    ];

    Promise.all([
      prefetchExercisesData({ q: '', bodyPart: 'all' }),
      ...defaultIds.map((id) => prefetchExerciseDetail(id)),
    ]).catch(() => {});
  };

  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(runPrefetch, { timeout: 2000 });
  } else {
    setTimeout(runPrefetch, 800);
  }
}
