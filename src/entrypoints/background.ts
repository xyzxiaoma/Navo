import { browser } from 'wxt/browser';
import { defineBackground } from 'wxt/utils/define-background';
import { getBingQuerySuggestions } from '../services/bing-suggestions.service';
import {
  isBingSuggestionsRequest,
  type BingSuggestionsResponse,
} from '../services/bing-suggestions.message';
import { canRequestSearchSuggestions } from '../utils/url';

export default defineBackground(() => {
  browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (!isBingSuggestionsRequest(message)) return;

    if (!canRequestSearchSuggestions(message.query)) {
      sendResponse({ ok: true, suggestions: [] } satisfies BingSuggestionsResponse);
      return;
    }

    void getBingQuerySuggestions(message.query)
      .then((suggestions) => {
        sendResponse({ ok: true, suggestions } satisfies BingSuggestionsResponse);
      })
      .catch((error: unknown) => {
        sendResponse({
          ok: false,
          error: error instanceof Error ? error.message : 'Bing suggestions request failed.',
        } satisfies BingSuggestionsResponse);
      });

    return true;
  });
});
