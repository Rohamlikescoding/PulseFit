import { NextRequest, NextResponse } from 'next/server';
import { CURATED_EXERCISES } from '../../../src/data/exercisesData';

// Mapping for default routine exercises to WorkoutAPI UUIDs
const WORKOUT_API_ID_MAP: Record<string, string> = {
  'db-bench-press': 'a095f383-164d-475d-a0ae-dd6ab8bbaeec', // Dumbbell Bench Press
  'db-bent-over-row': 'f67a8d31-717e-43fd-87ae-34883aabd597', // Bent Over Dumbbell Row
  'db-overhead-press': '91225d92-9e08-4a04-ae22-a027c567387c', // Dumbbell Shoulder Press
  'db-bicep-curl': '703427b1-2044-41d2-b2e5-51b2f24bb11a', // Dumbbell Biceps Curl
  'db-goblet-squat': 'd8086830-0afe-429a-8835-94bf71987b2d', // Goblet squat
  'db-romanian-deadlift': 'a1f03945-557c-4600-ac85-863ebc83c834', // Stiff leg deadlift
  'db-walking-lunge': 'a982911d-dbac-45ea-835e-6b939af62d55', // Lunges
  'db-russian-twist': '88bed810-9a41-499f-9282-638d7cba30a1', // Russian twist
  'db-incline-bench-press': '647fe4ff-9f6a-4fbe-87bf-5b1a3f0cbe13', // Incline Dumbbell Bench Press
  'db-chest-fly': 'a439612a-281b-4a17-b70f-d0c0a87e6816', // Reverse Fly on Incline Bench
  'db-lateral-raise': 'd2ad01d8-0b71-4bae-9e28-ad52b28b46da', // Lateral Raise with Dumbbells
  'db-arnold-press': '61c34eb6-9e29-49df-9c2b-e7649cf3ec68', // Arnold Dumbbell Press
  'db-hammer-curl': 'b03a494c-8b1d-41e2-a37c-95c8f74aa1bf', // Dumbbell Hammer Grip Curl
  'db-shrugs': '17bde461-176e-4bf0-8674-e627e594fafc', // Dumbbell Shrugs
};

function deriveBodyPart(muscleName?: string, categoryName?: string): string {
  if (!muscleName && !categoryName) return 'General';
  const m = (muscleName || '').toLowerCase();
  const c = (categoryName || '').toLowerCase();

  if (m.includes('chest') || m.includes('pectoral')) return 'chest';
  if (m.includes('back') || m.includes('lat') || m.includes('trapezius') || m.includes('rhomboid')) return 'back';
  if (m.includes('shoulder') || m.includes('deltoid')) return 'shoulders';
  if (m.includes('bicep') || m.includes('tricep') || m.includes('forearm') || m.includes('arm')) return 'upper arms';
  if (m.includes('quad') || m.includes('hamstring') || m.includes('glute') || m.includes('calf') || m.includes('leg')) return 'legs';
  if (m.includes('core') || m.includes('ab') || m.includes('oblique')) return 'core';
  if (c.includes('chest')) return 'chest';
  if (c.includes('back')) return 'back';
  if (c.includes('leg')) return 'legs';
  return 'general';
}

function splitIntoInstructions(text?: string): string[] {
  if (!text) return [];
  return text
    .split(/(?<=\.)\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 5);
}

function normalizeWorkoutApiItem(item: any) {
  const rawId = String(item.id || item.code?.toLowerCase().replace(/_/g, '-') || item.name?.toLowerCase().replace(/\s+/g, '-'));
  const primaryMuscle = item.primaryMuscles?.[0]?.name || item.target || '';
  const derivedBody = deriveBodyPart(primaryMuscle, item.categories?.[0]?.name);
  const instructions = item.description ? splitIntoInstructions(item.description) : (Array.isArray(item.instructions) ? item.instructions : []);

  return {
    id: rawId,
    name: item.name || 'Exercise',
    gifUrl: `/api/exercises/animation?id=${encodeURIComponent(rawId)}`,
    bodyPart: derivedBody,
    equipment: item.categories?.[0]?.name || 'Free weight',
    target: primaryMuscle || 'General',
    secondaryMuscles: Array.isArray(item.secondaryMuscles)
      ? item.secondaryMuscles.map((m: any) => m.name || m)
      : [],
    instructions,
    tips: [
      'Maintain proper postural alignment and brace your core through the full motion.',
      'Control the lowering phase (eccentric) for 2 full seconds to maximize tension.',
      'Exhale on the concentric lift, pause momentarily at peak contraction.',
    ],
    difficulty: 'intermediate',
    mechanics: item.types?.[0]?.name || 'Compound',
    force: 'Push',
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const exerciseId = (searchParams.get('id') || '').trim();
    const query = (searchParams.get('q') || '').trim().toLowerCase();
    const bodyPart = (searchParams.get('bodyPart') || '').trim().toLowerCase();

    const workoutApiKey =
      process.env.WORKOUT_API_KEY ||
      process.env.WORKOUTAPI_KEY ||
      process.env.EXERCISE_API_KEY;

    let source = 'fallback';
    let singleExercise: any = null;
    let results: any[] = [];

    // Upstream fetch to WorkoutAPI if API key configured
    if (workoutApiKey) {
      try {
        if (exerciseId) {
          const resolvedId = WORKOUT_API_ID_MAP[exerciseId] || exerciseId;
          const singleUrl = `https://api.workoutapi.com/v1/exercises/${encodeURIComponent(resolvedId)}`;
          const response = await fetch(singleUrl, {
            headers: {
              Authorization: `Bearer ${workoutApiKey}`,
              'x-api-key': workoutApiKey,
              Accept: 'application/json',
            },
            signal: AbortSignal.timeout(3500),
            next: {
              revalidate: 86400, // 24 hours
              tags: ['exercises'],
            },
          });

          if (response.ok) {
            const apiData = await response.json();
            const item = apiData?.data || apiData;
            if (item && (item.name || item.id)) {
              singleExercise = normalizeWorkoutApiItem(item);
              singleExercise.id = exerciseId;
              source = 'workoutapi';
            }
          }
        } else {
          // Fetch all exercises from WorkoutAPI
          const workoutApiUrl = 'https://api.workoutapi.com/v1/exercises';
          const response = await fetch(workoutApiUrl, {
            headers: {
              Authorization: `Bearer ${workoutApiKey}`,
              'x-api-key': workoutApiKey,
              Accept: 'application/json',
            },
            signal: AbortSignal.timeout(3500),
            next: {
              revalidate: 86400, // 24 hours
              tags: ['exercises'],
            },
          });

          if (response.ok) {
            const apiData = await response.json();
            const items = Array.isArray(apiData) ? apiData : apiData?.exercises || apiData?.data || [];
            if (items.length > 0) {
              let filtered = items.map(normalizeWorkoutApiItem);

              if (query) {
                const terms = query.split(' ').filter(Boolean);
                filtered = filtered.filter((ex: any) => {
                  const hay = `${ex.name} ${ex.bodyPart} ${ex.target} ${ex.equipment}`.toLowerCase();
                  return terms.every((t) => hay.includes(t));
                });
              }

              if (bodyPart && bodyPart !== 'all') {
                filtered = filtered.filter((ex: any) => ex.bodyPart.toLowerCase() === bodyPart);
              }

              results = filtered;
              source = 'workoutapi';
            }
          }
        }
      } catch (upstreamErr) {
        console.warn('[WorkoutAPI Route Handler] Upstream fetch failed or timed out:', upstreamErr);
      }
    }

    // Local / Curated Fallback
    if (exerciseId && !singleExercise) {
      const match =
        CURATED_EXERCISES.find((e) => e.id === exerciseId) ||
        CURATED_EXERCISES.find((e) => e.id.toLowerCase() === exerciseId.toLowerCase()) ||
        CURATED_EXERCISES.find((e) => e.name.toLowerCase().includes(exerciseId.toLowerCase())) ||
        null;
      if (match) {
        singleExercise = match;
      }
    } else if (!exerciseId && results.length === 0) {
      let filtered = CURATED_EXERCISES;
      if (bodyPart && bodyPart !== 'all') {
        filtered = filtered.filter((item) => item.bodyPart.toLowerCase() === bodyPart);
      }
      if (query) {
        const terms = query.split(' ').filter(Boolean);
        filtered = filtered.filter((item) => {
          const searchable = `${item.name} ${item.bodyPart} ${item.target || ''} ${item.equipment || ''}`.toLowerCase();
          return terms.every((t) => searchable.includes(t));
        });
      }
      results = filtered;
    }

    const payload = {
      source,
      apiKeyConfigured: Boolean(workoutApiKey),
      data: exerciseId ? singleExercise : results,
    };

    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Failed to process exercise request', details: err?.message },
      { status: 500 }
    );
  }
}
