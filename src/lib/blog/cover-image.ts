import { put } from '@vercel/blob';

export function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// Brand palette, pulled from the site: near-black base, lime accent.
const BASE = '#0a0a0a';
const LIME_FROM = '#a3e635';
const LIME_TO = '#65a30d';

const CATEGORY_LABELS: Record<string, string> = {
  training: 'Training',
  rehab: 'Rehab',
  mobility: 'Mobility',
  injury: 'Injury Prevention',
  strength: 'Strength',
  clinician: 'For Clinicians',
  product: 'LegLike',
};

/** Stable non-negative hash so the same title always renders the same cover. */
function seedFrom(title: string) {
  return (
    Math.abs([...slugify(title)].reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) >>> 0, 7)) %
    2147483647
  );
}

function escapeXml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** Greedy wrap so long headlines stay inside the canvas. */
function wrap(title: string, maxChars: number, maxLines: number) {
  const lines: string[] = [];
  let line = '';
  for (const word of title.split(/\s+/)) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length > maxChars && line) {
      lines.push(line);
      line = word;
      if (lines.length === maxLines) break;
    } else {
      line = candidate;
    }
  }
  if (line && lines.length < maxLines) lines.push(line);
  const kept = lines.slice(0, maxLines);
  if (kept.length === maxLines && kept.join(' ').length < title.length) {
    kept[maxLines - 1] = kept[maxLines - 1].replace(/[,.;:]?$/, '…');
  }
  return kept;
}

/**
 * Branded, deterministic SVG cover rendered locally. No network, no API key, no
 * billing — so this cannot fail. It is the safety net that guarantees a post is
 * never published with a blank cover slot.
 */
function brandedSvgCover(title: string, category: string): { body: Buffer; contentType: string } {
  const seed = seedFrom(title);
  const label = CATEGORY_LABELS[category] ?? 'LegLike';
  const lines = wrap(title, 30, 3);
  const startY = 512 - (lines.length - 1) * 46;

  // Seeded decorative circles: same title, same composition every time.
  const blobs = [0, 1, 2, 3]
    .map((i) => {
      const cx = 900 + ((seed >> (i * 3)) % 620);
      const cy = 120 + ((seed >> (i * 5)) % 800);
      const r = 90 + ((seed >> (i * 7)) % 200);
      const o = 0.05 + ((seed >> (i * 2)) % 7) / 100;
      return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#lime)" opacity="${o.toFixed(2)}"/>`;
    })
    .join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1536" height="1024" viewBox="0 0 1536 1024" role="img">
  <defs>
    <linearGradient id="lime" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${LIME_FROM}"/>
      <stop offset="100%" stop-color="${LIME_TO}"/>
    </linearGradient>
  </defs>
  <rect width="1536" height="1024" fill="${BASE}"/>
  ${blobs}
  <rect x="0" y="0" width="14" height="1024" fill="url(#lime)"/>
  <text x="96" y="300" font-family="Inter, Helvetica, Arial, sans-serif" font-size="30" font-weight="600" letter-spacing="6" fill="url(#lime)">${escapeXml(
    label.toUpperCase()
  )}</text>
  ${lines
    .map(
      (l, i) =>
        `<text x="96" y="${startY + i * 92}" font-family="Inter, Helvetica, Arial, sans-serif" font-size="76" font-weight="700" fill="#ffffff">${escapeXml(
          l
        )}</text>`
    )
    .join('\n  ')}
  <text x="96" y="900" font-family="Inter, Helvetica, Arial, sans-serif" font-size="34" font-weight="600" fill="#ffffff" opacity="0.55">leglike.com</text>
</svg>`;

  return { body: Buffer.from(svg, 'utf8'), contentType: 'image/svg+xml' };
}

/**
 * Ask OpenAI for a photoreal-ish editorial illustration. Returns null on any
 * failure so the caller can fall back rather than publish a coverless post.
 */
async function openAiCover(title: string, category: string): Promise<{ body: Buffer; contentType: string } | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    console.error('[Blog] OPENAI_API_KEY missing — using branded fallback cover');
    return null;
  }

  const prompt =
    `Clean, modern flat editorial illustration for a fitness/physical-therapy blog article titled "${title}" ` +
    `(category: ${category}). Show a person doing lower-body training, mobility work, or rehab exercise in a ` +
    `bright minimal gym or home setting relevant to the topic. Minimal premium fitness-app blog cover style, ` +
    `dark neutral background with a lime-green accent. Absolutely no text, no letters, no numbers and no logos anywhere in the image.`;

  try {
    // Quality is set explicitly and deliberately. gpt-image-1 defaults to
    // "auto", which resolves to the high tier at ~$0.25 per 1536x1024 image -
    // about $7.50/month for one post a day. "medium" is ~$0.063 (~$1.90/month)
    // and is indistinguishable at blog-cover size. Never leave this unset.
    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt,
        size: '1536x1024',
        quality: 'medium',
        n: 1,
      }),
      signal: AbortSignal.timeout(75000),
    });

    if (!res.ok) {
      console.error(`[Blog] OpenAI image failed: ${res.status} ${(await res.text().catch(() => '')).slice(0, 300)}`);
      return null;
    }

    const json = (await res.json()) as { data?: Array<{ b64_json?: string }> };
    const b64 = json.data?.[0]?.b64_json;
    if (!b64) {
      console.error('[Blog] OpenAI image response had no b64_json');
      return null;
    }

    const body = Buffer.from(b64, 'base64');
    if (body.byteLength < 1000) {
      console.error(`[Blog] OpenAI image suspiciously small (${body.byteLength} bytes)`);
      return null;
    }
    return { body, contentType: 'image/png' };
  } catch (e: unknown) {
    console.error('[Blog] OpenAI image threw:', e instanceof Error ? e.message : e);
    return null;
  }
}

/**
 * Generate a cover for an article and store it in Vercel Blob.
 *
 * Tries OpenAI first, falls back to a locally rendered branded SVG. Only a Blob
 * upload failure can produce null, so in practice every post gets a cover.
 */
export async function generateCoverImage(title: string, category: string): Promise<string | null> {
  const image = (await openAiCover(title, category)) ?? brandedSvgCover(title, category);

  try {
    // This Blob store is private-only. Blog posts are public pages, so the
    // image is proxied via /api/blog/cover-image, which needs no session.
    const ext =
      image.contentType === 'image/svg+xml' ? 'svg' : image.contentType.includes('png') ? 'png' : 'jpg';
    const blob = await put(`blog-covers/${slugify(title)}-${Date.now()}.${ext}`, image.body, {
      access: 'private',
      contentType: image.contentType,
    });
    return `/api/blog/cover-image?url=${encodeURIComponent(blob.url)}`;
  } catch (e: unknown) {
    console.error('[Blog] Cover image upload failed:', e instanceof Error ? e.message : e);
    return null;
  }
}
