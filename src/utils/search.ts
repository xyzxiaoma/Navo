import type { NavoBookmarkNode, NavoNodeType } from '../types/bookmark';

export interface SearchIndexItem {
  id: string;
  type: NavoNodeType;
  title: string;
  url?: string;
  domain?: string;
  pathText: string;
  node: NavoBookmarkNode;
}

export interface GroupedSearchResults {
  folders: SearchIndexItem[];
  bookmarks: SearchIndexItem[];
}

export const emptySearchResults: GroupedSearchResults = {
  folders: [],
  bookmarks: [],
};

export function createSearchIndex(nodes: NavoBookmarkNode[]): SearchIndexItem[] {
  const items: SearchIndexItem[] = [];
  const roots = hasSyntheticRoot(nodes) ? nodes[0].children ?? [] : nodes;

  function walk(list: NavoBookmarkNode[], parentPath: string[]) {
    for (const node of list) {
      const path = [...parentPath, node.title];
      items.push({
        id: node.id,
        type: node.type,
        title: node.title,
        url: node.url,
        domain: node.domain,
        pathText: path.join(' / '),
        node,
      });

      if (node.children?.length) walk(node.children, path);
    }
  }

  walk(roots, []);
  return items;
}

export function searchBookmarks(
  index: SearchIndexItem[],
  keyword: string,
): GroupedSearchResults {
  const query = keyword.trim().toLowerCase();
  if (!query) return emptySearchResults;

  const results: GroupedSearchResults = {
    folders: [],
    bookmarks: [],
  };

  for (const item of index) {
    if (!matchesSearchItem(item, query)) continue;

    if (item.type === 'folder') {
      results.folders.push(item);
    } else {
      results.bookmarks.push(item);
    }
  }

  return results;
}

function hasSyntheticRoot(nodes: NavoBookmarkNode[]): boolean {
  const root = nodes[0];
  return (
    nodes.length === 1 &&
    root?.type === 'folder' &&
    root.parentId === undefined &&
    root.raw.parentId === undefined
  );
}

function matchesSearchItem(item: SearchIndexItem, query: string): boolean {
  return (
    item.title.toLowerCase().includes(query) ||
    (item.url?.toLowerCase().includes(query) ?? false) ||
    (item.domain?.toLowerCase().includes(query) ?? false) ||
    item.pathText.toLowerCase().includes(query)
  );
}
