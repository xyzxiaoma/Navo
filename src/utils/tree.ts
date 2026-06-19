import type {
  BrowserBookmarkNode,
  FolderChildren,
  NavoBookmarkNode,
} from '../types/bookmark';
import { getDomain } from './url';

export function isBrowserFolder(node: BrowserBookmarkNode): boolean {
  return Array.isArray(node.children);
}

export function isNavoFolder(node: NavoBookmarkNode): boolean {
  return node.type === 'folder';
}

export function isNavoBookmark(node: NavoBookmarkNode): boolean {
  return node.type === 'bookmark';
}

export function transformBookmarkTree(
  nodes: BrowserBookmarkNode[],
): NavoBookmarkNode[] {
  return nodes.map((node) => transformBookmarkNode(node, []));
}

export function findNodeById(
  nodes: NavoBookmarkNode[],
  nodeId: string,
): NavoBookmarkNode | undefined {
  for (const node of nodes) {
    if (node.id === nodeId) return node;

    if (node.children) {
      const match = findNodeById(node.children, nodeId);
      if (match) return match;
    }
  }

  return undefined;
}

export function findFolderById(
  nodes: NavoBookmarkNode[],
  nodeId: string,
): NavoBookmarkNode | undefined {
  const node = findNodeById(nodes, nodeId);
  return node && isNavoFolder(node) ? node : undefined;
}

export function getPathNodes(
  nodes: NavoBookmarkNode[],
  nodeId: string,
): NavoBookmarkNode[] {
  for (const node of nodes) {
    if (node.id === nodeId) return [node];

    if (node.children) {
      const childPath = getPathNodes(node.children, nodeId);
      if (childPath.length > 0) return [node, ...childPath];
    }
  }

  return [];
}

export function getEffectiveRootFolders(
  nodes: NavoBookmarkNode[],
): NavoBookmarkNode[] {
  if (nodes.length === 1 && nodes[0]?.children?.length) {
    return nodes[0].children.filter(isNavoFolder);
  }

  return nodes.filter(isNavoFolder);
}

export function getFirstFolder(
  nodes: NavoBookmarkNode[],
): NavoBookmarkNode | undefined {
  const rootFolders = getEffectiveRootFolders(nodes);
  if (rootFolders[0]) return rootFolders[0];

  for (const node of nodes) {
    if (isNavoFolder(node)) return node;
    if (node.children) {
      const childFolder = getFirstFolder(node.children);
      if (childFolder) return childFolder;
    }
  }

  return undefined;
}

export function getFolderChildren(folder?: NavoBookmarkNode): FolderChildren {
  const children = folder?.children ?? [];

  return {
    folders: children.filter(isNavoFolder),
    bookmarks: children.filter(isNavoBookmark),
  };
}

export function getDirectChildCount(folder?: NavoBookmarkNode): number {
  return folder?.children?.length ?? 0;
}

export function getChildTypeCounts(folder?: NavoBookmarkNode): {
  folderCount: number;
  bookmarkCount: number;
} {
  const children = getFolderChildren(folder);

  return {
    folderCount: children.folders.length,
    bookmarkCount: children.bookmarks.length,
  };
}

function transformBookmarkNode(
  node: BrowserBookmarkNode,
  parentPath: string[],
): NavoBookmarkNode {
  const type = isBrowserFolder(node) ? 'folder' : 'bookmark';
  const domain = node.url ? getDomain(node.url) : undefined;
  const title = getNodeTitle(node, domain);
  const path = title ? [...parentPath, title] : parentPath;
  const children = node.children?.map((child) => transformBookmarkNode(child, path));

  return {
    id: node.id,
    type,
    title,
    url: node.url,
    domain,
    parentId: node.parentId,
    children,
    path,
    raw: node,
  };
}

function getNodeTitle(node: BrowserBookmarkNode, domain?: string): string {
  const title = node.title.trim();
  if (title) return title;
  if (domain) return domain;
  if (node.url) return node.url;
  return 'Untitled';
}
