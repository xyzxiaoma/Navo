import { browser } from 'wxt/browser';
import { getBingQuerySuggestions } from './bing-suggestions.service';
import {
  BING_SUGGESTIONS_MESSAGE_TYPE,
  type BingSuggestionsRequest,
  type BingSuggestionsResponse,
} from './bing-suggestions.message';
import { requestSuggestionsWithFallback } from './search-suggestions.fallback';

export async function requestBingQuerySuggestions(
  input: string,
  signal?: AbortSignal,
): Promise<string[]> {
  const query = input.trim();
  if (!query) return [];
  throwIfAborted(signal);

  return requestSuggestionsWithFallback(
    () => getBingQuerySuggestions(query, signal),
    async () => {
      const response = await browser.runtime.sendMessage<BingSuggestionsRequest, BingSuggestionsResponse>({
        type: BING_SUGGESTIONS_MESSAGE_TYPE,
        query,
      });
      throwIfAborted(signal);
      if (!response?.ok) throw new Error(response?.error ?? 'Bing suggestions background service is unavailable.');
      return response.suggestions;
    },
  );
}

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) throw new DOMException('The operation was aborted.', 'AbortError');
}
