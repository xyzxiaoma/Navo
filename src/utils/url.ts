const GOOGLE_SEARCH_URL = 'https://www.google.com/search';
const HOST_LIKE_INPUT_PATTERN =
  /^(localhost|(?:\d{1,3}\.){3}\d{1,3}|(?:[a-z0-9-]+\.)+[a-z]{2,})(?::\d+)?(?:[/?#].*)?$/i;

export function isDirectNavigationInput(input: string): boolean {
  const query = input.trim();
  return Boolean(query && (getHttpUrl(query) || HOST_LIKE_INPUT_PATTERN.test(query)));
}

export function canRequestSearchSuggestions(input: string): boolean {
  const query = input.trim();
  return Boolean(query && query.length <= 200 && !isDirectNavigationInput(query));
}

export function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export function getDisplayUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.hostname}${parsed.pathname === '/' ? '' : parsed.pathname}`;
  } catch {
    return url;
  }
}

export function getSearchNavigationTarget(input: string): string | undefined {
  const query = input.trim();
  if (!query) return undefined;

  if (isDirectNavigationInput(query)) {
    const normalizedUrl = getHttpUrl(query) ?? getHttpUrl(`https://${query}`);
    if (normalizedUrl) return normalizedUrl.href;
  }

  const searchUrl = new URL(GOOGLE_SEARCH_URL);
  searchUrl.searchParams.set('q', query);
  return searchUrl.href;
}

function getHttpUrl(value: string): URL | undefined {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) ? url : undefined;
  } catch {
    return undefined;
  }
}
