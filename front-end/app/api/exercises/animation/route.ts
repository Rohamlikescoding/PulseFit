import { NextRequest, NextResponse } from 'next/server';

const WORKOUT_API_ID_MAP: Record<string, string> = {
  'db-bench-press': 'a095f383-164d-475d-a0ae-dd6ab8bbaeec',
  'db-bent-over-row': 'f67a8d31-717e-43fd-87ae-34883aabd597',
  'db-overhead-press': '91225d92-9e08-4a04-ae22-a027c567387c',
  'db-bicep-curl': '703427b1-2044-41d2-b2e5-51b2f24bb11a',
  'db-goblet-squat': 'd8086830-0afe-429a-8835-94bf71987b2d',
  'db-romanian-deadlift': 'a1f03945-557c-4600-ac85-863ebc83c834',
  'db-walking-lunge': 'a982911d-dbac-45ea-835e-6b939af62d55',
  'db-russian-twist': '88bed810-9a41-499f-9282-638d7cba30a1',
  'db-incline-bench-press': '647fe4ff-9f6a-4fbe-87bf-5b1a3f0cbe13',
  'db-chest-fly': 'a439612a-281b-4a17-b70f-d0c0a87e6816',
  'db-lateral-raise': 'd2ad01d8-0b71-4bae-9e28-ad52b28b46da',
  'db-arnold-press': '61c34eb6-9e29-49df-9c2b-e7649cf3ec68',
  'db-hammer-curl': 'b03a494c-8b1d-41e2-a37c-95c8f74aa1bf',
  'db-shrugs': '17bde461-176e-4bf0-8674-e627e594fafc',
};

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function createFallbackAnimatedSvg(exerciseName: string): string {
  const safeName = escapeXml((exerciseName || '').slice(0, 80));
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
      <rect x="-70" y="-8" width="140" height="16" rx="4" fill="#94A3B8" />
      <rect x="-86" y="-45" width="18" height="90" rx="8" fill="url(#amber)" />
      <rect x="-104" y="-35" width="16" height="70" rx="6" fill="#D98200" />
      <rect x="68" y="-45" width="18" height="90" rx="8" fill="url(#amber)" />
      <rect x="88" y="-35" width="16" height="70" rx="6" fill="#D98200" />
      <line x1="-30" y1="-8" x2="-30" y2="8" stroke="#334155" stroke-width="3" />
      <line x1="-15" y1="-8" x2="-15" y2="8" stroke="#334155" stroke-width="3" />
      <line x1="0" y1="-8" x2="0" y2="8" stroke="#334155" stroke-width="3" />
      <line x1="15" y1="-8" x2="15" y2="8" stroke="#334155" stroke-width="3" />
      <line x1="30" y1="-8" x2="30" y2="8" stroke="#334155" stroke-width="3" />
    </g>

    <circle cx="300" cy="120" r="6" fill="#22C55E">
      <animate attributeName="opacity" values="0.3;1;0.3" dur="1.2s" repeatCount="indefinite" />
      <animate attributeName="r" values="4;8;4" dur="1.2s" repeatCount="indefinite" />
    </circle>
    <text x="300" y="340" font-family="system-ui, sans-serif" font-size="14" font-weight="700" fill="#F8FAFC" text-anchor="middle">
      ${safeName || 'Form Demonstration'}
    </text>
    <text x="300" y="365" font-family="monospace" font-size="11" fill="#94A3B8" text-anchor="middle">
      Controlled Tempo · Full Range of Motion
    </text>
  </svg>`;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const rawId = (searchParams.get('id') || '').trim();
    const resolvedId = WORKOUT_API_ID_MAP[rawId] || rawId;

    const workoutApiKey =
      process.env.WORKOUT_API_KEY ||
      process.env.WORKOUTAPI_KEY ||
      process.env.EXERCISE_API_KEY;

    if (workoutApiKey && resolvedId) {
      try {
        const animUrl = `https://api.workoutapi.com/v1/exercises/${encodeURIComponent(resolvedId)}/animation`;
        const animRes = await fetch(animUrl, {
          headers: {
            'x-api-key': workoutApiKey,
            Authorization: `Bearer ${workoutApiKey}`,
          },
          signal: AbortSignal.timeout(4000),
          next: {
            revalidate: 86400 * 7, // 7 days
            tags: ['exercises-animation'],
          },
        });

        if (animRes.ok) {
          const buffer = await animRes.arrayBuffer();
          return new NextResponse(buffer, {
            status: 200,
            headers: {
              'Content-Type': 'image/gif',
              'Cache-Control': 'public, max-age=86400, immutable',
            },
          });
        }
      } catch (upstreamAnimErr) {
        console.warn('[WorkoutAPI Animation] Upstream fetch failed or timed out:', upstreamAnimErr);
      }
    }

    // Fallback SVG animation
    const fallbackSvg = createFallbackAnimatedSvg(rawId.replace(/[-_]/g, ' '));
    return new NextResponse(fallbackSvg, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (err: any) {
    // Never cache error responses
    return NextResponse.json(
      { error: 'Failed to stream animation', details: err?.message },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache',
        },
      }
    );
  }
}
