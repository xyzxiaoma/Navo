export const BING_SUGGESTIONS_MESSAGE_TYPE = 'navo:get-bing-suggestions';

export interface BingSuggestionsRequest {
  type: typeof BING_SUGGESTIONS_MESSAGE_TYPE;
  query: string;
}

export type BingSuggestionsResponse =
  | { ok: true; suggestions: string[] }
  | { ok: false; error: string };

export function isBingSuggestionsRequest(value: unknown): value is BingSuggestionsRequest {
  if (!value || typeof value !== 'object') return false;
  const request = value as Partial<BingSuggestionsRequest>;
  return request.type === BING_SUGGESTIONS_MESSAGE_TYPE && typeof request.query === 'string';
}
