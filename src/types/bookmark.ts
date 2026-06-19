export interface BrowserBookmarkNode {
  id: string;
  parentId?: string;
  index?: number;
  title: string;
  url?: string;
  dateAdded?: number;
  dateGroupModified?: number;
  children?: BrowserBookmarkNode[];
}

export type NavoNodeType = 'folder' | 'bookmark';

export interface NavoBookmarkNode {
  id: string;
  type: NavoNodeType;
  title: string;
  url?: string;
  domain?: string;
  parentId?: string;
  children?: NavoBookmarkNode[];
  path: string[];
  raw: BrowserBookmarkNode;
}

export interface FolderChildren {
  folders: NavoBookmarkNode[];
  bookmarks: NavoBookmarkNode[];
}
