import assert from 'node:assert/strict';
import test from 'node:test';
import { getBingQuerySuggestions, parseBingSuggestionResponse } from './bing-suggestions.service.ts';
import {
  BING_SUGGESTIONS_MESSAGE_TYPE,
  isBingSuggestionsRequest,
} from './bing-suggestions.message.ts';
import { requestSuggestionsWithFallback } from './search-suggestions.fallback.ts';

test('parses, deduplicates, and limits Bing suggestions to nine', () => {
  const response = JSON.stringify([
    '微信',
    ['微信', '微信文件传输助手', ' 微信网页版 ', '微信文件传输助手', '', '微信读书', '微信输入法', '微信传输助手', '微信公众平台', '微信公众号', '微信 下载', '微信电脑版官方下载'],
  ]);

  assert.deepEqual(parseBingSuggestionResponse(response, '微信'), [
    '微信文件传输助手',
    '微信网页版',
    '微信读书',
    '微信输入法',
    '微信传输助手',
    '微信公众平台',
    '微信公众号',
    '微信 下载',
    '微信电脑版官方下载',
  ]);
});

test('falls back to the secondary Bing endpoint', async () => {
  const originalFetch = globalThis.fetch;
  const requestedHosts = [];

  globalThis.fetch = async (url) => {
    const requestUrl = new URL(url);
    requestedHosts.push(requestUrl.hostname);
    if (requestUrl.hostname === 'api.bing.com') {
      return new Response('', { status: 503 });
    }
    return new Response(JSON.stringify(['联想回退测试', ['联想回退测试结果']]), { status: 200 });
  };

  try {
    assert.deepEqual(await getBingQuerySuggestions('联想回退测试'), ['联想回退测试结果']);
    assert.deepEqual(requestedHosts, ['api.bing.com', 'www.bing.com']);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('uses the secondary transport when the primary request fails', async () => {
  const suggestions = await requestSuggestionsWithFallback(
    async () => {
      throw new Error('Failed to fetch');
    },
    async () => ['微信文件传输助手', '微信网页版'],
  );

  assert.deepEqual(suggestions, ['微信文件传输助手', '微信网页版']);
});

test('keeps primary results when the request succeeds', async () => {
  let fallbackRequested = false;
  const suggestions = await requestSuggestionsWithFallback(
    async () => ['微信文件传输助手'],
    async () => {
      fallbackRequested = true;
      return ['微信网页版'];
    },
  );

  assert.deepEqual(suggestions, ['微信文件传输助手']);
  assert.equal(fallbackRequested, false);
});

test('validates internal Bing suggestion messages', () => {
  assert.equal(isBingSuggestionsRequest({ type: BING_SUGGESTIONS_MESSAGE_TYPE, query: '微信' }), true);
  assert.equal(isBingSuggestionsRequest({ type: BING_SUGGESTIONS_MESSAGE_TYPE, query: 1 }), false);
  assert.equal(isBingSuggestionsRequest({ type: 'other', query: '微信' }), false);
  assert.equal(isBingSuggestionsRequest(null), false);
});

test('rejects invalid or unexpected Bing responses', () => {
  assert.throws(
    () => parseBingSuggestionResponse('callback([])', '微信'),
    /not valid JSON/,
  );
  assert.throws(
    () => parseBingSuggestionResponse(JSON.stringify({ suggestions: [] }), '微信'),
    /unexpected format/,
  );
});
