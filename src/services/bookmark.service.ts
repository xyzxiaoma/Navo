import type { NavoBookmarkNode } from '../types/bookmark';
import { transformBookmarkTree } from '../utils/tree';
import { browserApi } from './browser-api';

export async function getBookmarkTree(): Promise<NavoBookmarkNode[]> {
  const tree = await browserApi.bookmarks.getTree();
  return transformBookmarkTree(tree);
}
