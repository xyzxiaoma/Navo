import type { NavoBookmarkNode } from '../types/bookmark';
import { transformBookmarkTree } from '../utils/tree';
import { browserApi } from './browser-api';

export interface CreateBookmarkInput {
  parentId: string;
  title: string;
  url: string;
}

export interface CreateFolderInput {
  parentId: string;
  title: string;
}

export interface UpdateBookmarkInput {
  id: string;
  title: string;
  url: string;
}

export interface UpdateFolderInput {
  id: string;
  title: string;
}

export async function getBookmarkTree(): Promise<NavoBookmarkNode[]> {
  const tree = await browserApi.bookmarks.getTree();
  return transformBookmarkTree(tree);
}

export async function createBookmark(
  input: CreateBookmarkInput,
): Promise<string> {
  const node = await browserApi.bookmarks.create({
    parentId: input.parentId,
    title: input.title.trim(),
    url: normalizeBookmarkUrl(input.url),
  });

  return node.id;
}

export async function createFolder(input: CreateFolderInput): Promise<string> {
  const node = await browserApi.bookmarks.create({
    parentId: input.parentId,
    title: input.title.trim(),
  });

  return node.id;
}

export async function updateBookmark(input: UpdateBookmarkInput): Promise<void> {
  await browserApi.bookmarks.update(input.id, {
    title: input.title.trim(),
    url: normalizeBookmarkUrl(input.url),
  });
}

export async function updateFolder(input: UpdateFolderInput): Promise<void> {
  await browserApi.bookmarks.update(input.id, {
    title: input.title.trim(),
  });
}

export async function deleteBookmark(id: string): Promise<void> {
  await browserApi.bookmarks.remove(id);
}

export async function deleteFolder(id: string): Promise<void> {
  await browserApi.bookmarks.removeTree(id);
}

function normalizeBookmarkUrl(url: string): string {
  const trimmedUrl = url.trim();

  if (/^[a-z][a-z\d+.-]*:/i.test(trimmedUrl)) {
    return trimmedUrl;
  }

  return `https://${trimmedUrl}`;
}
