# Add Bookmark Search Design

## Scope

This task adds search indexing and search results UI. It does not implement advanced fuzzy matching or pinyin search.

## Search Types

Add search contracts to `src/utils/search.ts`:

```typescript
interface SearchIndexItem {
  id: string;
  type: 'folder' | 'bookmark';
  title: string;
  url?: string;
  domain?: string;
  pathText: string;
  node: NavoBookmarkNode;
}

interface GroupedSearchResults {
  folders: SearchIndexItem[];
  bookmarks: SearchIndexItem[];
}
```

## Flow

1. Bookmark tree loads once.
2. App builds an index with `createSearchIndex(bookmarkTree)`.
3. Search input updates `searchDraft` immediately.
4. A 150ms timer updates `debouncedSearchQuery`.
5. Empty debounced query shows folder browsing.
6. Non-empty query shows grouped search results.
7. Folder result click selects folder, expands its path, persists selected folder, and clears search.
8. Bookmark result click uses normal anchor navigation.

## Matching

Normalize query by `trim().toLowerCase()`. Match with substring includes against title, URL, domain, and path text.

## Validation

Use lint, typecheck, Chrome build, and Edge build.
