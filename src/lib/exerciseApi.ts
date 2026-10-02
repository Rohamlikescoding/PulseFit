import { CURATED_EXERCISES } from '../data/exercisesData';
import { Exercise } from '../types/workout';

// In-memory client cache
const cache = new Map<string, Exercise[]>();
const singleExerciseCache = new Map<string, Exercise>();
let lastApiStatus = { source: 'local', apiKeyConfigured: false };

export function getExerciseApiStatus() {
  return lastApiStatus;
}

export async function fetchExercises(params: {
  q?: string;
  bodyPart?: string;
}): Promise<Exercise[]> {
  const query = (params.q || '').trim().toLowerCase();
  const bodyPart = (params.bodyPart || '').trim().toLowerCase();
  const cacheKey = `${query}|${bodyPart}`;

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)!;
  }

  try {
    const searchParams = new URLSearchParams();
    if (query) searchParams.set('q', query);
    if (bodyPart && bodyPart !== 'all') searchParams.set('bodyPart', bodyPart);

    const response = await fetch(`/api/exercises?${searchParams.toString()}`, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (response.ok) {
      const json = await response.json();
      const items = Array.isArray(json) ? json : json?.data;
      if (json?.source) {
        lastApiStatus = {
          source: json.source,
          apiKeyConfigured: Boolean(json.apiKeyConfigured),
        };
      }

      if (Array.isArray(items) && items.length > 0) {
        cache.set(cacheKey, items);
        items.forEach((item: Exercise) => {
          if (item?.id) singleExerciseCache.set(item.id, item);
        });
        return items;
      }
    }
  } catch (err) {
    console.warn('[ExerciseAPI] Route handler fetch failed, using fallback dataset:', err);
  }

  // Fallback to local curated exercises
  let results = CURATED_EXERCISES;

  if (bodyPart && bodyPart !== 'all') {
    results = results.filter((item) => item.bodyPart.toLowerCase() === bodyPart);
  }

  if (query) {
    const terms = query.split(' ').filter(Boolean);
    results = results.filter((item) => {
      const searchable = `${item.name} ${item.bodyPart} ${item.target || ''} ${item.equipment || ''}`.toLowerCase();
      return terms.every((t) => searchable.includes(t));
    });
  }

  cache.set(cacheKey, results);
  results.forEach((item) => {
    if (item?.id) singleExerciseCache.set(item.id, item);
  });
  return results;
}

/**
 * Fetch detailed exercise by ID directly from WorkoutAPI or fallback database
 */
export async function fetchExerciseById(id: string): Promise<Exercise | null> {
  if (!id) return null;

  if (singleExerciseCache.has(id)) {
    return singleExerciseCache.get(id)!;
  }

  try {
    const response = await fetch(`/api/exercises?id=${encodeURIComponent(id)}`, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (response.ok) {
      const json = await response.json();
      const item = json?.data || json;
      if (item && item.name) {
        singleExerciseCache.set(id, item);
        return item;
      }
    }
  } catch (err) {
    console.warn('[ExerciseAPI] Fetch by ID failed, using local lookup:', err);
  }

  // Fallback to curated exercises lookup
  const match =
    CURATED_EXERCISES.find((e) => e.id === id) ||
    CURATED_EXERCISES.find((e) => e.id.toLowerCase() === id.toLowerCase()) ||
    CURATED_EXERCISES.find((e) => e.name.toLowerCase().includes(id.toLowerCase())) ||
    null;

  if (match) {
    const enriched = {
      ...match,
      gifUrl: match.gifUrl?.startsWith('/api/exercises')
        ? match.gifUrl
        : `/api/exercises/animation?id=${encodeURIComponent(match.id)}`,
    };
    singleExerciseCache.set(id, enriched);
    return enriched;
  }

  return match;
}
