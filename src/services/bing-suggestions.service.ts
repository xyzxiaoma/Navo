const BING_SUGGESTIONS_URLS = [
  'https://api.bing.com/osjson.aspx',
  'https://www.bing.com/osjson.aspx',
];
const suggestionLimit = 9;
const requestTimeout = 1500;
const cacheLifetime = 5 * 60 * 1000;
const cacheLimit = 50;

interface SuggestionCacheEntry {
  expiresAt: number;
  values: string[];
}

const suggestionCache = new Map<string, SuggestionCacheEntry>();

export async function getBingQuerySuggestions(
  input: string,
  signal?: AbortSignal,
): Promise<string[]> {
  const query = input.trim();
  if (!query) return [];

  const cacheKey = query.toLowerCase();
  const cached = suggestionCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.values;
  if (cached) suggestionCache.delete(cacheKey);

  let lastError: unknown;
  for (const endpoint of BING_SUGGESTIONS_URLS) {
    try {
      const values = await requestBingQuerySuggestions(endpoint, query, signal);
      cacheSuggestions(cacheKey, values);
      return values;
    } catch (error) {
      if (signal?.aborted) throw error;
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Bing suggestions request failed.');
}

async function requestBingQuerySuggestions(
  endpoint: string,
  query: string,
  signal?: AbortSignal,
): Promise<string[]> {
  const controller = new AbortController();
  const abortRequest = () => controller.abort();
  const timeout = setTimeout(abortRequest, requestTimeout);

  if (signal?.aborted) controller.abort();
  else signal?.addEventListener('abort', abortRequest, { once: true });

  try {
    const url = new URL(endpoint);
    url.searchParams.set('query', query);
    url.searchParams.set('language', 'zh-CN');

    const response = await fetch(url, {
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Bing suggestions request failed: ${response.status}`);

    return parseBingSuggestionResponse(await response.text(), query);
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', abortRequest);
  }
}

export function parseBingSuggestionResponse(responseText: string, query: string): string[] {
  let payload: unknown;
  try {
    payload = JSON.parse(responseText);
  } catch {
    throw new Error('Bing suggestions response is not valid JSON.');
  }

  const rawValues = Array.isArray(payload) && Array.isArray(payload[1]) ? payload[1] : undefined;
  if (!rawValues) throw new Error('Bing suggestions response has an unexpected format.');

  const seen = new Set([query.trim().toLowerCase()]);
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
  return values;
}

function cacheSuggestions(cacheKey: string, values: string[]) {
  if (suggestionCache.size >= cacheLimit) {
    const oldestKey = suggestionCache.keys().next().value;
    if (oldestKey) suggestionCache.delete(oldestKey);
  }
  suggestionCache.set(cacheKey, {
    expiresAt: Date.now() + cacheLifetime,
    values,
  });
}
