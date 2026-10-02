import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

// Server-side caches
const serverExerciseCache = new Map<string, { timestamp: number; data: any }>();
const serverAnimationCache = new Map<string, Buffer>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

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

// Muscle to body part categorization
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

// Fallback animated SVG when external network is unavailable
function createFallbackAnimatedSvg(exerciseName: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="100%" height="100%">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0F172B" />
        <stop offset="100%" stop-color="#141D32" />
      </linearGradient>
      <linearGradient id="amber" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFAA00" />
        <stop offset="100%" stop-color="#F59E00" />
      </linearGradient>
    </defs>
    <rect width="600" height="400" fill="url(#bg)" rx="16" />
    <circle cx="300" cy="200" r="110" fill="none" stroke="#24324A" stroke-width="2" stroke-dasharray="6 6" />
    
    <!-- Animated Dumbbell -->
    <g transform="translate(300, 200)">
      <animateTransform attributeName="transform" type="translate" values="300, 230; 300, 160; 300, 230" dur="2.4s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1" />
      <!-- Bar -->
      <rect x="-70" y="-8" width="140" height="16" rx="4" fill="#94A3B8" />
      <!-- Left Plates -->
      <rect x="-86" y="-45" width="18" height="90" rx="8" fill="url(#amber)" />
      <rect x="-104" y="-35" width="16" height="70" rx="6" fill="#D98200" />
      <!-- Right Plates -->
      <rect x="68" y="-45" width="18" height="90" rx="8" fill="url(#amber)" />
      <rect x="88" y="-35" width="16" height="70" rx="6" fill="#D98200" />
      <!-- Center Grip Texture -->
      <line x1="-30" y1="-8" x2="-30" y2="8" stroke="#334155" stroke-width="3" />
      <line x1="-15" y1="-8" x2="-15" y2="8" stroke="#334155" stroke-width="3" />
      <line x1="0" y1="-8" x2="0" y2="8" stroke="#334155" stroke-width="3" />
      <line x1="15" y1="-8" x2="15" y2="8" stroke="#334155" stroke-width="3" />
      <line x1="30" y1="-8" x2="30" y2="8" stroke="#334155" stroke-width="3" />
    </g>

    <!-- Pulsing target dot -->
    <circle cx="300" cy="120" r="6" fill="#22C55E">
      <animate attributeName="opacity" values="0.3;1;0.3" dur="1.2s" repeatCount="indefinite" />
      <animate attributeName="r" values="4;8;4" dur="1.2s" repeatCount="indefinite" />
    </circle>
    <text x="300" y="340" font-family="system-ui, sans-serif" font-size="14" font-weight="700" fill="#F8FAFC" text-anchor="middle">
      ${exerciseName || 'Form Demonstration'}
    </text>
    <text x="300" y="365" font-family="monospace" font-size="11" fill="#94A3B8" text-anchor="middle">
      Controlled Tempo · Full Range of Motion
    </text>
  </svg>`;
}

function exerciseApiPlugin(): Plugin {
  return {
    name: 'exercise-api-middleware',
    configureServer(server) {
      server.middlewares.use('/api/exercises', async (req, res) => {
        try {
          const url = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
          const pathname = url.pathname;
          const workoutApiKey =
            process.env.WORKOUT_API_KEY ||
            process.env.WORKOUTAPI_KEY ||
            process.env.EXERCISE_API_KEY;

          // =========================================================================
          // 1. ANIMATION GIF STREAMING ENDPOINT: /api/exercises/animation?id=...
          // =========================================================================
          if (pathname.includes('/animation') || url.searchParams.get('animation') === 'true') {
            const rawId = (url.searchParams.get('id') || pathname.replace(/^\/animation\/?/, '')).trim();
            const resolvedId = WORKOUT_API_ID_MAP[rawId] || rawId;

            // Check in-memory GIF cache
            if (serverAnimationCache.has(resolvedId)) {
              const buffer = serverAnimationCache.get(resolvedId)!;
              res.statusCode = 200;
              res.setHeader('Content-Type', 'image/gif');
              res.setHeader('Content-Length', buffer.length);
              res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
              res.end(buffer);
              return;
            }

            // Fetch real GIF from WorkoutAPI with secret key in server headers
            if (workoutApiKey && resolvedId) {
              try {
                const animUrl = `https://api.workoutapi.com/v1/exercises/${encodeURIComponent(resolvedId)}/animation`;
                const animRes = await fetch(animUrl, {
                  headers: {
                    'x-api-key': workoutApiKey,
                    'Authorization': `Bearer ${workoutApiKey}`,
                  },
                });

                if (animRes.ok) {
                  const arrayBuf = await animRes.arrayBuffer();
                  const buffer = Buffer.from(arrayBuf);
                  serverAnimationCache.set(resolvedId, buffer);
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'image/gif');
                  res.setHeader('Content-Length', buffer.length);
                  res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
                  res.end(buffer);
                  return;
                } else {
                  console.warn(`[WorkoutAPI] Animation fetch for ${resolvedId} returned ${animRes.status}`);
                }
              } catch (animErr) {
                console.warn('[WorkoutAPI] Error fetching animation:', animErr);
              }
            }

            // Fallback SVG animation
            const fallbackSvg = createFallbackAnimatedSvg(rawId.replace(/[-_]/g, ' '));
            res.statusCode = 200;
            res.setHeader('Content-Type', 'image/svg+xml');
            res.setHeader('Cache-Control', 'public, max-age=3600');
            res.end(fallbackSvg);
            return;
          }

          // =========================================================================
          // 2. EXERCISE JSON DATA: /api/exercises?q=... or ?id=...
          // =========================================================================
          const exerciseId = (url.searchParams.get('id') || '').trim();
          const query = (url.searchParams.get('q') || '').trim().toLowerCase();
          const bodyPart = (url.searchParams.get('bodyPart') || '').trim().toLowerCase();
          const cacheKey = exerciseId ? `id:${exerciseId}` : `${query}:${bodyPart}`;

          // Check memory cache for JSON responses
          const cached = serverExerciseCache.get(cacheKey);
          if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('X-Cache', 'HIT');
            res.end(JSON.stringify(cached.data));
            return;
          }

          // Helper to normalize WorkoutAPI exercise item
          const normalizeWorkoutApiItem = (item: any) => {
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
          };

          let results: any[] = [];
          let singleExercise: any = null;
          let source = 'fallback';

          // Call WorkoutAPI (https://docs.workoutapi.com/api/get-all-exercises)
          if (workoutApiKey) {
            try {
              if (exerciseId) {
                const resolvedId = WORKOUT_API_ID_MAP[exerciseId] || exerciseId;
                const singleUrl = `https://api.workoutapi.com/v1/exercises/${encodeURIComponent(resolvedId)}`;
                const response = await fetch(singleUrl, {
                  headers: {
                    'Authorization': `Bearer ${workoutApiKey}`,
                    'x-api-key': workoutApiKey,
                    'Accept': 'application/json',
                  },
                });

                if (response.ok) {
                  const apiData = await response.json();
                  const item = apiData?.data || apiData;
                  if (item && (item.name || item.id)) {
                    singleExercise = normalizeWorkoutApiItem(item);
                    // Maintain requested ID for compatibility
                    singleExercise.id = exerciseId;
                    source = 'workoutapi';
                  }
                }
              } else {
                // Fetch all exercises from WorkoutAPI
                const workoutApiUrl = 'https://api.workoutapi.com/v1/exercises';
                const response = await fetch(workoutApiUrl, {
                  headers: {
                    'Authorization': `Bearer ${workoutApiKey}`,
                    'x-api-key': workoutApiKey,
                    'Accept': 'application/json',
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
            } catch (workoutErr) {
              console.warn('[WorkoutAPI] Connection error:', workoutErr);
            }
          }

          const payload = {
            source,
            apiKeyConfigured: Boolean(workoutApiKey),
            data: singleExercise || results,
          };

          serverExerciseCache.set(cacheKey, { timestamp: Date.now(), data: payload });
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('X-Cache', 'MISS');
          res.end(JSON.stringify(payload));
        } catch (err: any) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Failed to process exercise request', details: err?.message }));
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), exerciseApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
