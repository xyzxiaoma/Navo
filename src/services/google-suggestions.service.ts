const GOOGLE_SUGGESTIONS_URL = 'https://suggestqueries.google.com/complete/search';
const suggestionLimit = 5;
const requestTimeout = 4000;
const cacheLifetime = 5 * 60 * 1000;
const cacheLimit = 50;

interface SuggestionCacheEntry {
  expiresAt: number;
  values: string[];
}

const suggestionCache = new Map<string, SuggestionCacheEntry>();

export async function getGoogleQuerySuggestions(
  input: string,
  signal?: AbortSignal,
): Promise<string[]> {
  const query = input.trim();
  if (!query) return [];

  const cacheKey = query.toLowerCase();
  const cached = suggestionCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.values;
  if (cached) suggestionCache.delete(cacheKey);

  const controller = new AbortController();
  const abortRequest = () => controller.abort();
  const timeout = setTimeout(abortRequest, requestTimeout);

  if (signal?.aborted) controller.abort();
  else signal?.addEventListener('abort', abortRequest, { once: true });

  try {
    const url = new URL(GOOGLE_SUGGESTIONS_URL);
    url.searchParams.set('client', 'chrome');
    url.searchParams.set('hl', 'zh-CN');
    url.searchParams.set('q', query);

    const response = await fetch(url, {
      credentials: 'omit',
      headers: { Accept: 'application/json' },
      referrerPolicy: 'no-referrer',
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Google suggestions request failed: ${response.status}`);

    const payload: unknown = await response.json();
    const rawValues = Array.isArray(payload) && Array.isArray(payload[1]) ? payload[1] : undefined;
    if (!rawValues) throw new Error('Google suggestions response has an unexpected format.');

    const seen = new Set([cacheKey]);
    const values: string[] = [];
    for (const rawValue of rawValues) {
      if (typeof rawValue !== 'string') continue;
      const value = rawValue.trim();
      const normalized = value.toLowerCase();
      if (!value || seen.has(normalized)) continue;
      seen.add(normalized);
      values.push(value);
      if (values.length === suggestionLimit) break;
    }

    if (suggestionCache.size >= cacheLimit) {
      const oldestKey = suggestionCache.keys().next().value;
      if (oldestKey) suggestionCache.delete(oldestKey);
    }
    suggestionCache.set(cacheKey, {
      expiresAt: Date.now() + cacheLifetime,
      values,
    });
    return values;
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', abortRequest);
  }
}
