<script lang="ts">
  import Icon from '@iconify/svelte';
  import alertCircleIcon from '@iconify-icons/lucide/alert-circle';
  import bookmarkIcon from '@iconify-icons/lucide/bookmark';
  import bookmarkPlusIcon from '@iconify-icons/lucide/bookmark-plus';
  import chevronRightIcon from '@iconify-icons/lucide/chevron-right';
  import fileQuestionIcon from '@iconify-icons/lucide/file-question';
  import folderIcon from '@iconify-icons/lucide/folder';
  import folderPlusIcon from '@iconify-icons/lucide/folder-plus';
  import historyIcon from '@iconify-icons/lucide/history';
  import homeIcon from '@iconify-icons/lucide/home';
  import moonIcon from '@iconify-icons/lucide/moon';
  import panelLeftCloseIcon from '@iconify-icons/lucide/panel-left-close';
  import panelLeftOpenIcon from '@iconify-icons/lucide/panel-left-open';
  import pencilIcon from '@iconify-icons/lucide/pencil';
  import searchIcon from '@iconify-icons/lucide/search';
  import sunIcon from '@iconify-icons/lucide/sun';
  import trashIcon from '@iconify-icons/lucide/trash-2';
  import xIcon from '@iconify-icons/lucide/x';
  import { onDestroy, onMount, tick } from 'svelte';
  import { browserApi } from '../../services/browser-api';
  import {
    createBookmark,
    createFolder,
    deleteBookmark,
    deleteFolder,
    getBookmarkTree,
    updateBookmark,
    updateFolder,
  } from '../../services/bookmark.service';
  import { defaultSettings, getSettings, saveSettings } from '../../services/storage.service';
  import type { NavoBookmarkNode } from '../../types/bookmark';
  import type { NavoLocalSettings, ThemeMode } from '../../types/settings';
  import { createSearchIndex, searchBookmarks, type SearchIndexItem } from '../../utils/search';
  import {
    findFolderById,
    getAllUrlBookmarks,
    getDirectChildCount,
    getEffectiveRootFolders,
    getFirstFolder,
    getFolderChildren,
    getFolderOverviewSections,
    getPathNodes,
    type FolderOverviewSection,
  } from '../../utils/tree';
  import { getDisplayUrl, getSearchNavigationTarget } from '../../utils/url';

  type LoadStatus = 'loading' | 'ready' | 'empty' | 'error';
  type ActiveView = 'home' | 'bookmarks';
  type EditorMode = 'create' | 'edit';
  type EditorKind = 'folder' | 'bookmark';

  interface VisibleFolderRow {
    folder: NavoBookmarkNode;
    depth: number;
    childFolderCount: number;
    expanded: boolean;
    selected: boolean;
    matched: boolean;
  }

  interface BookmarkSearchOption {
    item: SearchIndexItem;
    id: string;
  }

  interface BookmarkEditorState {
    mode: EditorMode;
    kind: EditorKind;
    parentId?: string;
    targetId?: string;
    title: string;
    url: string;
    error: string;
    saving: boolean;
  }

  const fixedBookmarkLimit = 8;
  const recentBookmarkLimit = 8;
  const googleSuggestionLimit = 9;
  const bookmarkFolderResultLimit = 6;
  const bookmarkResultLimit = 8;
  const jumpFeedbackDuration = 1200;
  const commonGoogleSuggestions = [
    '163邮箱',
    '1688',
    '163',
    '163邮箱登录',
    '111',
    '11',
    '1111',
    '17track',
    '126邮箱',
    'github',
    'gmail',
    'google translate',
    'chatgpt',
    'youtube',
    'bilibili',
    '淘宝',
    '京东',
    '知乎',
    '百度网盘',
    'linux do',
  ];
  const googleSuggestionSuffixes = [
    '官网',
    '下载',
    '登录',
    '教程',
    '文档',
    'github',
    '价格',
    '是什么',
    '怎么用',
  ];

  let theme: ThemeMode = defaultSettings.theme;
  let activeView: ActiveView = 'home';
  let organizeMode = false;
  let searchInputElement: HTMLInputElement | undefined;
  let searchDraft = '';
  let searchFocused = false;
  let searchSuggestionsDismissed = false;
  let activeSearchOptionIndex = -1;
  let bookmarkSearchInputElement: HTMLInputElement | undefined;
  let bookmarkSearchDraft = '';
  let bookmarkSearchFocused = false;
  let bookmarkSearchDismissed = false;
  let activeBookmarkSearchOptionIndex = -1;
  let folderFilterDraft = '';
  let status: LoadStatus = 'loading';
  let settingsInitialized = false;
  let errorMessage = '';
  let actionError = '';
  let settings: NavoLocalSettings = {
    ...defaultSettings,
    bookmarkClickCounts: {},
    fixedBookmarkIds: [],
    bookmarkLastOpenedAt: {},
  };
  let sidebarCollapsed = defaultSettings.sidebarCollapsed;
  let bookmarkTree: NavoBookmarkNode[] = [];
  let selectedFolderId: string | undefined;
  let visibleFolderId: string | undefined;
  let expandedFolderIds: string[] = [];
  let editorState: BookmarkEditorState | undefined;
  let mutating = false;
  let contentScroller: HTMLElement | undefined;
  let sectionElements: Record<string, HTMLElement> = {};
  let sidebarRowElements: Record<string, HTMLElement> = {};
  let observer: IntersectionObserver | undefined;
  let observerRoot: HTMLElement | null | undefined;
  let observerResizeQuery: MediaQueryList | undefined;
  let restoreFolderOnViewOpen = false;
  let jumpTargetFolderId: string | undefined;
  let jumpFeedbackTimer: ReturnType<typeof setTimeout> | undefined;
  let settingsWriteQueue: Promise<void> = Promise.resolve();

  let rootFolders: NavoBookmarkNode[] = [];
  let folderSections: FolderOverviewSection[] = [];
  let allBookmarks: NavoBookmarkNode[] = [];
  let visibleFolderRows: VisibleFolderRow[] = [];
  let fixedBookmarks: NavoBookmarkNode[] = [];
  let recentBookmarks: NavoBookmarkNode[] = [];
  let googleSuggestions: string[] = [];
  let searchOptions: string[] = [];
  let showSearchSuggestions = false;
  let activeSearchOptionId: string | undefined;
  let bookmarkSearchIndex: SearchIndexItem[] = [];
  let bookmarkFolderResults: SearchIndexItem[] = [];
  let bookmarkResults: SearchIndexItem[] = [];
  let bookmarkSearchOptions: BookmarkSearchOption[] = [];
  let showBookmarkSearchResults = false;
  let activeBookmarkSearchOptionId: string | undefined;
  let folderFilterVisibleIds: string[] | undefined;
  let directFolderFilterMatches: string[] = [];

  $: rootFolders = getEffectiveRootFolders(bookmarkTree);
  $: folderSections = getFolderOverviewSections(bookmarkTree);
  $: allBookmarks = getAllUrlBookmarks(bookmarkTree);
  $: bookmarkSearchIndex = createSearchIndex(bookmarkTree);
  $: ({ visibleIds: folderFilterVisibleIds, directMatches: directFolderFilterMatches } = getFolderFilterState(rootFolders, folderFilterDraft));
  $: visibleFolderRows = getVisibleFolderRows(rootFolders, expandedFolderIds, visibleFolderId ?? selectedFolderId, 0, folderFilterVisibleIds, directFolderFilterMatches);
  $: fixedBookmarks = getFixedBookmarks(allBookmarks, settings.fixedBookmarkIds);
  $: recentBookmarks = getRecentBookmarks(allBookmarks, settings);
  $: {
    const results = searchBookmarks(bookmarkSearchIndex, bookmarkSearchDraft);
    const sectionIds = folderSections.map((section) => section.folder.id);
    bookmarkFolderResults = results.folders.filter((item) => sectionIds.includes(item.id)).slice(0, bookmarkFolderResultLimit);
    bookmarkResults = results.bookmarks.slice(0, bookmarkResultLimit);
    bookmarkSearchOptions = [
      ...bookmarkFolderResults.map((item) => ({ item, id: getBookmarkSearchOptionId(item) })),
      ...bookmarkResults.map((item) => ({ item, id: getBookmarkSearchOptionId(item) })),
    ];
  }
  $: googleSuggestions = getGoogleSuggestions(searchDraft);
  $: searchOptions = searchDraft.trim() ? [searchDraft.trim(), ...googleSuggestions] : [];
  $: showSearchSuggestions = searchFocused && !searchSuggestionsDismissed && searchOptions.length > 0;
  $: if (activeSearchOptionIndex >= searchOptions.length) activeSearchOptionIndex = searchOptions.length - 1;
  $: activeSearchOptionId = showSearchSuggestions && activeSearchOptionIndex >= 0
    ? getSearchOptionId(activeSearchOptionIndex)
    : undefined;
  $: showBookmarkSearchResults = bookmarkSearchFocused && !bookmarkSearchDismissed && Boolean(bookmarkSearchDraft.trim());
  $: if (activeBookmarkSearchOptionIndex >= bookmarkSearchOptions.length) activeBookmarkSearchOptionIndex = bookmarkSearchOptions.length - 1;
  $: activeBookmarkSearchOptionId = showBookmarkSearchResults && activeBookmarkSearchOptionIndex >= 0
    ? bookmarkSearchOptions[activeBookmarkSearchOptionIndex]?.id
    : undefined;
  $: if (visibleFolderId) keepSidebarRowVisible(visibleFolderId);

  onMount(() => {
    observerResizeQuery = window.matchMedia('(max-width: 720px)');
    observerResizeQuery.addEventListener('change', handleObserverLayoutChange);
    void loadWorkspace();
  });

  onDestroy(() => {
    observer?.disconnect();
    observerResizeQuery?.removeEventListener('change', handleObserverLayoutChange);
    if (jumpFeedbackTimer) clearTimeout(jumpFeedbackTimer);
  });

  async function loadWorkspace() {
    status = 'loading';
    errorMessage = '';
    actionError = '';

    const [settingsResult, treeResult] = await Promise.allSettled([getSettings(), getBookmarkTree()]);

    if (settingsResult.status === 'fulfilled') {
      settings = settingsResult.value;
      theme = settingsResult.value.theme;
      sidebarCollapsed = settingsResult.value.sidebarCollapsed;
      settingsInitialized = true;
    }

    if (settingsResult.status === 'rejected') {
      status = 'error';
      const error = settingsResult.reason;
      errorMessage = error instanceof Error ? error.message : '加载设置失败。';
      return;
    }
    if (treeResult.status === 'rejected') {
      status = 'error';
      const error = treeResult.reason;
      errorMessage = error instanceof Error ? error.message : '加载书签失败。';
      return;
    }

    const loadedSettings = settingsResult.value;
    const loadedTree = treeResult.value;
    const savedFolder = loadedSettings.lastSelectedFolderId
      ? findFolderById(loadedTree, loadedSettings.lastSelectedFolderId)
      : undefined;
    const fallbackFolder = savedFolder ?? getFirstFolder(loadedTree);
    const validIds = getAllUrlBookmarks(loadedTree).map((bookmark) => bookmark.id);
    const cleanedFixedIds = loadedSettings.fixedBookmarkIds.filter((id) => validIds.includes(id));
    const fixedIdsNeedCleanup = cleanedFixedIds.length !== loadedSettings.fixedBookmarkIds.length;
    const nextSettings = fixedIdsNeedCleanup
      ? { ...loadedSettings, fixedBookmarkIds: cleanedFixedIds }
      : loadedSettings;

    settings = nextSettings;
    theme = nextSettings.theme;
    sidebarCollapsed = nextSettings.sidebarCollapsed;
    bookmarkTree = loadedTree;
    selectedFolderId = fallbackFolder?.id;
    visibleFolderId = fallbackFolder?.id;
    expandedFolderIds = getDefaultExpandedFolderIds(loadedTree, fallbackFolder?.id);
    status = fallbackFolder ? 'ready' : 'empty';

    if (fixedIdsNeedCleanup) {
      try {
        await enqueueSettingsWrite((current) => ({
          ...current,
          fixedBookmarkIds: cleanedFixedIds,
        }));
      } catch {
        actionError = '书签已加载，但清理失效固定项时保存失败。其他功能仍可使用。';
      }
    }

    if (activeView === 'bookmarks') {
      restoreFolderOnViewOpen = true;
      await prepareBookmarkView();
    }
  }

  async function refreshBookmarkTree(preferredFolderId?: string) {
    const loadedTree = await getBookmarkTree();
    const fallbackFolder = (preferredFolderId ? findFolderById(loadedTree, preferredFolderId) : undefined)
      ?? (selectedFolderId ? findFolderById(loadedTree, selectedFolderId) : undefined)
      ?? getFirstFolder(loadedTree);
    const validIds = getAllUrlBookmarks(loadedTree).map((bookmark) => bookmark.id);
    const cleanedFixedIds = settings.fixedBookmarkIds.filter((id) => validIds.includes(id));

    bookmarkTree = loadedTree;
    selectedFolderId = fallbackFolder?.id;
    visibleFolderId = fallbackFolder?.id;
    expandedFolderIds = fallbackFolder ? addSelectedPath(expandedFolderIds, loadedTree, fallbackFolder.id) : [];
    status = fallbackFolder ? 'ready' : 'empty';

    if (cleanedFixedIds.length !== settings.fixedBookmarkIds.length) {
      try {
        await persistSettings(
          (current) => ({ ...current, fixedBookmarkIds: cleanedFixedIds }),
          { errorMessage: '书签已刷新，但清理失效固定项时保存失败。' },
        );
      } catch {
        // The refreshed tree remains usable; persistSettings surfaces the nonblocking error.
      }
    }
    if (activeView === 'bookmarks') await prepareBookmarkView();
  }

  function setActiveView(nextView: ActiveView) {
    activeView = nextView;
    if (nextView === 'bookmarks') {
      restoreFolderOnViewOpen = true;
      void prepareBookmarkView();
      return;
    }

    observer?.disconnect();
    observer = undefined;
  }

  async function prepareBookmarkView() {
    await tick();
    setupSectionObserver();
    if (!restoreFolderOnViewOpen) return;
    restoreFolderOnViewOpen = false;
    const targetId = selectedFolderId && sectionElements[selectedFolderId]
      ? selectedFolderId
      : folderSections[0]?.folder.id;
    if (targetId) await scrollToFolder(targetId, false, false);
  }

  function setupSectionObserver() {
    observer?.disconnect();
    observerRoot = undefined;
    if (!contentScroller || typeof IntersectionObserver === 'undefined') return;
    const root = observerResizeQuery?.matches ? null : contentScroller;
    observerRoot = root;
    observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((first, second) => first.boundingClientRect.top - second.boundingClientRect.top)[0];
        const id = visible?.target.getAttribute('data-folder-id');
        if (id) visibleFolderId = id;
      },
      { root, rootMargin: '-8% 0px -75% 0px', threshold: [0, 0.01] },
    );
    for (const section of Object.values(sectionElements)) observer.observe(section);
  }

  function handleObserverLayoutChange() {
    if (activeView !== 'bookmarks') return;
    const nextRoot = observerResizeQuery?.matches ? null : contentScroller;
    if (nextRoot !== observerRoot) setupSectionObserver();
  }

  function registerSection(node: HTMLElement, folderId: string) {
    sectionElements = { ...sectionElements, [folderId]: node };
    observer?.observe(node);
    return {
      destroy() {
        observer?.unobserve(node);
        sectionElements = Object.fromEntries(
          Object.entries(sectionElements).filter(([id]) => id !== folderId),
        );
      },
    };
  }

  function registerSidebarRow(node: HTMLElement, folderId: string) {
    sidebarRowElements = { ...sidebarRowElements, [folderId]: node };
    return {
      destroy() {
        sidebarRowElements = Object.fromEntries(
          Object.entries(sidebarRowElements).filter(([id]) => id !== folderId),
        );
      },
    };
  }

  function keepSidebarRowVisible(folderId: string) {
    if (sidebarCollapsed) return;
    void tick().then(() => {
      sidebarRowElements[folderId]?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'auto' });
    });
  }

  async function selectFolder(folderId: string) {
    await scrollToFolder(folderId, true, settingsInitialized);
  }

  async function scrollToFolder(folderId: string, focus: boolean, persist: boolean) {
    const folder = findFolderById(bookmarkTree, folderId);
    if (!folder) return;
    selectedFolderId = folderId;
    visibleFolderId = folderId;
    expandedFolderIds = addSelectedPath(expandedFolderIds, bookmarkTree, folderId);
    if (focus) showJumpFeedback(folderId);
    if (persist) {
      void persistSettings((current) => ({ ...current, lastSelectedFolderId: folderId }), {
        errorMessage: '保存上次打开的文件夹失败。',
      }).catch(() => undefined);
    }
    await tick();
    const section = sectionElements[folderId];
    section?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
    if (focus) section?.querySelector<HTMLElement>('.folder-section-title')?.focus({ preventScroll: true });
  }

  function showJumpFeedback(folderId: string) {
    if (jumpFeedbackTimer) clearTimeout(jumpFeedbackTimer);
    jumpTargetFolderId = folderId;
    jumpFeedbackTimer = setTimeout(() => {
      jumpTargetFolderId = undefined;
      jumpFeedbackTimer = undefined;
    }, jumpFeedbackDuration);
  }

  function toggleFolder(folderId: string) {
    expandedFolderIds = expandedFolderIds.includes(folderId)
      ? expandedFolderIds.filter((id) => id !== folderId)
      : [...expandedFolderIds, folderId];
  }

  function toggleOrganizeMode() {
    if (!settingsInitialized || isMutationLocked()) return;
    organizeMode = !organizeMode;
    actionError = '';
    if (!organizeMode) editorState = undefined;
  }

  async function openBookmark(bookmark: NavoBookmarkNode) {
    if (!bookmark.url || !settingsInitialized) return;

    const optimisticOpenedAt = Date.now();
    let previousClickCount = 0;
    let previousOpenedAt: number | undefined;
    let optimisticClickCount = 0;
    try {
      await persistSettings(
        (current) => {
          previousClickCount = current.bookmarkClickCounts[bookmark.id] ?? 0;
          previousOpenedAt = current.bookmarkLastOpenedAt[bookmark.id];
          optimisticClickCount = previousClickCount + 1;
          return {
            ...current,
            bookmarkClickCounts: {
              ...current.bookmarkClickCounts,
              [bookmark.id]: optimisticClickCount,
            },
            bookmarkLastOpenedAt: {
              ...current.bookmarkLastOpenedAt,
              [bookmark.id]: optimisticOpenedAt,
            },
          };
        },
        { errorMessage: '打开书签前保存记录失败，请重试。' },
      );
    } catch {
      const clickCountIsCurrent = settings.bookmarkClickCounts[bookmark.id] === optimisticClickCount;
      const openedAtIsCurrent = settings.bookmarkLastOpenedAt[bookmark.id] === optimisticOpenedAt;
      if (clickCountIsCurrent && openedAtIsCurrent) {
        const nextClickCounts = { ...settings.bookmarkClickCounts };
        if (previousClickCount > 0) nextClickCounts[bookmark.id] = previousClickCount;
        else delete nextClickCounts[bookmark.id];
        const nextLastOpenedAt = { ...settings.bookmarkLastOpenedAt };
        if (previousOpenedAt !== undefined) nextLastOpenedAt[bookmark.id] = previousOpenedAt;
        else delete nextLastOpenedAt[bookmark.id];
        settings = {
          ...settings,
          bookmarkClickCounts: nextClickCounts,
          bookmarkLastOpenedAt: nextLastOpenedAt,
        };
      }
      return;
    }
    window.location.assign(bookmark.url);
  }

  function getFixedBookmarks(bookmarks: NavoBookmarkNode[], fixedIds: string[]) {
    return fixedIds
      .map((id) => bookmarks.find((bookmark) => bookmark.id === id))
      .filter((bookmark): bookmark is NavoBookmarkNode => Boolean(bookmark));
  }

  function getRecentBookmarks(bookmarks: NavoBookmarkNode[], currentSettings: NavoLocalSettings) {
    return bookmarks
      .map((bookmark, browserIndex) => ({
        bookmark,
        browserIndex,
        openedAt: currentSettings.bookmarkLastOpenedAt[bookmark.id] ?? 0,
        clickCount: currentSettings.bookmarkClickCounts[bookmark.id] ?? 0,
      }))
      .filter((item) => item.openedAt > 0 && !currentSettings.fixedBookmarkIds.includes(item.bookmark.id))
      .sort((first, second) => second.openedAt - first.openedAt || second.clickCount - first.clickCount || first.browserIndex - second.browserIndex)
      .slice(0, recentBookmarkLimit)
      .map((item) => item.bookmark);
  }

  function isFixed(bookmarkId: string) {
    return settings.fixedBookmarkIds.includes(bookmarkId);
  }

  async function toggleFixedBookmark(bookmarkId: string) {
    if (!settingsInitialized || isMutationLocked()) return;
    const previousFixedIds = settings.fixedBookmarkIds;
    const fixed = previousFixedIds.includes(bookmarkId);
    if (!fixed && previousFixedIds.length >= fixedBookmarkLimit) {
      actionError = `固定区最多只能保留 ${fixedBookmarkLimit} 个书签。请先移除一项。`;
      return;
    }

    const nextFixedIds = fixed
      ? previousFixedIds.filter((id) => id !== bookmarkId)
      : [...previousFixedIds, bookmarkId];

    mutating = true;
    actionError = '';
    settings = { ...settings, fixedBookmarkIds: nextFixedIds };
    try {
      await persistSettings(
        (current) => ({ ...current, fixedBookmarkIds: nextFixedIds }),
        { errorMessage: '保存固定区失败，已恢复之前的顺序。', rollback: { fixedBookmarkIds: previousFixedIds } },
      );
    } catch {
      // persistSettings restored the fixed list and surfaced the error.
    } finally {
      mutating = false;
    }
  }

  async function moveFixedBookmark(index: number, offset: -1 | 1) {
    if (!settingsInitialized || isMutationLocked()) return;
    const targetIndex = index + offset;
    const previousFixedIds = settings.fixedBookmarkIds;
    if (targetIndex < 0 || targetIndex >= previousFixedIds.length) return;
    const ids = [...previousFixedIds];
    [ids[index], ids[targetIndex]] = [ids[targetIndex]!, ids[index]!];

    mutating = true;
    actionError = '';
    settings = { ...settings, fixedBookmarkIds: ids };
    try {
      await persistSettings(
        (current) => ({ ...current, fixedBookmarkIds: ids }),
        { errorMessage: '保存固定区排序失败，已恢复之前的顺序。', rollback: { fixedBookmarkIds: previousFixedIds } },
      );
    } catch {
      // persistSettings restored the fixed list and surfaced the error.
    } finally {
      mutating = false;
    }
  }

  interface PersistSettingsOptions {
    errorMessage?: string;
    rollback?: Partial<NavoLocalSettings>;
  }

  function enqueueSettingsWrite(
    update: (current: NavoLocalSettings) => NavoLocalSettings,
  ): Promise<void> {
    const write = settingsWriteQueue.then(async () => {
      const nextSettings = update(settings);
      settings = nextSettings;
      theme = nextSettings.theme;
      sidebarCollapsed = nextSettings.sidebarCollapsed;
      await saveSettings(nextSettings);
    });
    settingsWriteQueue = write.catch(() => undefined);
    return write;
  }

  async function persistSettings(
    update: (current: NavoLocalSettings) => NavoLocalSettings,
    options: PersistSettingsOptions = {},
  ) {
    try {
      await enqueueSettingsWrite(update);
    } catch (error) {
      if (options.rollback) {
        settings = { ...settings, ...options.rollback };
        theme = settings.theme;
        sidebarCollapsed = settings.sidebarCollapsed;
      }
      if (options.errorMessage) actionError = options.errorMessage;
      throw error;
    }
  }

  function isMutationLocked() {
    return mutating || Boolean(editorState?.saving);
  }

  function openCreateFolderEditor(parentId: string) {
    if (!settingsInitialized || isMutationLocked()) return;
    editorState = { mode: 'create', kind: 'folder', parentId, title: '', url: '', error: '', saving: false };
  }

  function openCreateBookmarkEditor(parentId: string) {
    if (!settingsInitialized || isMutationLocked()) return;
    editorState = { mode: 'create', kind: 'bookmark', parentId, title: '', url: '', error: '', saving: false };
  }

  function openEditFolderEditor(folder: NavoBookmarkNode) {
    if (!settingsInitialized || isMutationLocked()) return;
    if (!canModifyBookmarkNode(folder)) {
      actionError = '这个浏览器管理的文件夹不能编辑。';
      return;
    }
    editorState = { mode: 'edit', kind: 'folder', targetId: folder.id, title: folder.title, url: '', error: '', saving: false };
  }

  function openEditBookmarkEditor(bookmark: NavoBookmarkNode) {
    if (!settingsInitialized || isMutationLocked()) return;
    editorState = { mode: 'edit', kind: 'bookmark', targetId: bookmark.id, title: bookmark.title, url: bookmark.url ?? '', error: '', saving: false };
  }

  function closeEditor() {
    if (!editorState?.saving) editorState = undefined;
  }

  function updateEditorState(changes: Partial<BookmarkEditorState>) {
    if (editorState) editorState = { ...editorState, ...changes };
  }

  async function submitBookmarkEditor(event: SubmitEvent) {
    event.preventDefault();
    if (!editorState || editorState.saving) return;
    const state = editorState;
    const title = state.title.trim();
    const url = state.url.trim();
    if (!title || (state.kind === 'bookmark' && !url)) {
      updateEditorState({ error: !title ? '请输入名称。' : '请输入网址。' });
      return;
    }
    updateEditorState({ saving: true, error: '' });
    try {
      if (state.mode === 'create' && state.kind === 'folder' && state.parentId) {
        const id = await createFolder({ parentId: state.parentId, title });
        await refreshBookmarkTree(id);
      } else if (state.mode === 'create' && state.kind === 'bookmark' && state.parentId) {
        await createBookmark({ parentId: state.parentId, title, url });
        await refreshBookmarkTree(state.parentId);
      } else if (state.mode === 'edit' && state.kind === 'folder' && state.targetId) {
        await updateFolder({ id: state.targetId, title });
        await refreshBookmarkTree(state.targetId);
      } else if (state.targetId) {
        await updateBookmark({ id: state.targetId, title, url });
        await refreshBookmarkTree(selectedFolderId);
      }
      editorState = undefined;
    } catch (error) {
      updateEditorState({ saving: false, error: error instanceof Error ? error.message : '保存失败。' });
    }
  }

  async function deleteBookmarkItem(bookmark: NavoBookmarkNode) {
    if (!settingsInitialized || isMutationLocked()) return;
    if (!confirm(`删除书签“${bookmark.title}”？`)) return;
    await runBookmarkMutation(async () => {
      await deleteBookmark(bookmark.id);
      await refreshBookmarkTree(selectedFolderId);
    });
  }

  async function deleteFolderItem(folder: NavoBookmarkNode) {
    if (!settingsInitialized || isMutationLocked()) return;
    if (!canModifyBookmarkNode(folder)) {
      actionError = '这个浏览器管理的文件夹不能删除。';
      return;
    }
    if (!confirm(`删除文件夹“${folder.title}”以及其中的所有内容？`)) return;
    await runBookmarkMutation(async () => {
      await deleteFolder(folder.id);
      await refreshBookmarkTree(folder.parentId);
    });
  }

  async function runBookmarkMutation(action: () => Promise<void>) {
    if (mutating) return;
    mutating = true;
    actionError = '';
    try {
      await action();
    } catch (error) {
      actionError = error instanceof Error ? error.message : '书签操作失败。';
    } finally {
      mutating = false;
    }
  }

  function canModifyBookmarkNode(node: NavoBookmarkNode) {
    return node.parentId !== undefined && node.parentId !== '0';
  }

  function setTheme(nextTheme: ThemeMode) {
    if (!settingsInitialized) return;
    theme = nextTheme;
    settings = { ...settings, theme: nextTheme };
    void persistSettings((current) => ({ ...current, theme: nextTheme }), {
      errorMessage: '保存主题设置失败。',
    }).catch(() => undefined);
  }

  function toggleTheme() {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }

  function toggleSidebarCollapsed() {
    if (!settingsInitialized) return;
    sidebarCollapsed = !sidebarCollapsed;
    const nextSidebarCollapsed = sidebarCollapsed;
    settings = { ...settings, sidebarCollapsed: nextSidebarCollapsed };
    void persistSettings((current) => ({ ...current, sidebarCollapsed: nextSidebarCollapsed }), {
      errorMessage: '保存目录栏设置失败。',
    }).catch(() => undefined);
  }

  function handleSearchInput(event: Event) {
    searchDraft = (event.currentTarget as HTMLInputElement).value;
    searchFocused = true;
    searchSuggestionsDismissed = false;
    activeSearchOptionIndex = -1;
  }

  function handleSearchKeydown(event: KeyboardEvent) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      if (searchOptions.length === 0) return;
      event.preventDefault();
      searchSuggestionsDismissed = false;
      if (event.key === 'ArrowDown') {
        activeSearchOptionIndex = activeSearchOptionIndex < searchOptions.length - 1
          ? activeSearchOptionIndex + 1
          : 0;
      } else {
        activeSearchOptionIndex = activeSearchOptionIndex > 0
          ? activeSearchOptionIndex - 1
          : searchOptions.length - 1;
      }
      return;
    }

    if (event.key === 'Enter' && showSearchSuggestions && activeSearchOptionIndex >= 0) {
      event.preventDefault();
      const option = searchOptions[activeSearchOptionIndex];
      if (option) navigateToSearchTarget(option);
      return;
    }

    if (event.key === 'Escape' && showSearchSuggestions) {
      event.preventDefault();
      dismissSearchSuggestions();
    }
  }

  function handleSearchSubmit(event: SubmitEvent) {
    event.preventDefault();
    navigateToSearchTarget(searchDraft);
  }

  function navigateToSearchTarget(input: string) {
    const target = getSearchNavigationTarget(input);
    if (target) window.location.assign(target);
  }

  function getGoogleSuggestions(input: string) {
    const query = input.trim();
    if (!query) return [];
    const lower = query.toLowerCase();
    const values = [
      ...commonGoogleSuggestions.filter((suggestion) => suggestion.toLowerCase().startsWith(lower) && suggestion.toLowerCase() !== lower),
      ...googleSuggestionSuffixes.map((suffix) => `${query} ${suffix}`),
    ];
    return values.filter((value, index) => values.indexOf(value) === index).slice(0, googleSuggestionLimit);
  }

  function clearSearch() {
    searchDraft = '';
    activeSearchOptionIndex = -1;
    searchSuggestionsDismissed = true;
    searchFocused = true;
    searchInputElement?.focus();
  }

  function dismissSearchSuggestions() {
    activeSearchOptionIndex = -1;
    searchSuggestionsDismissed = true;
  }

  function getSearchOptionId(index: number) {
    if (index === 0) return 'search-option-primary';
    return `search-option-suggestion-${encodeURIComponent(searchOptions[index] ?? '')}`;
  }

  function handleBookmarkSearchInput(event: Event) {
    bookmarkSearchDraft = (event.currentTarget as HTMLInputElement).value;
    bookmarkSearchFocused = true;
    bookmarkSearchDismissed = false;
    activeBookmarkSearchOptionIndex = -1;
  }

  function handleBookmarkSearchKeydown(event: KeyboardEvent) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      if (bookmarkSearchOptions.length === 0) return;
      event.preventDefault();
      bookmarkSearchDismissed = false;
      if (event.key === 'ArrowDown') {
        activeBookmarkSearchOptionIndex = activeBookmarkSearchOptionIndex < bookmarkSearchOptions.length - 1
          ? activeBookmarkSearchOptionIndex + 1
          : 0;
      } else {
        activeBookmarkSearchOptionIndex = activeBookmarkSearchOptionIndex > 0
          ? activeBookmarkSearchOptionIndex - 1
          : bookmarkSearchOptions.length - 1;
      }
      return;
    }

    if (event.key === 'Enter' && showBookmarkSearchResults && activeBookmarkSearchOptionIndex >= 0) {
      event.preventDefault();
      const option = bookmarkSearchOptions[activeBookmarkSearchOptionIndex];
      if (option) void activateBookmarkSearchResult(option.item);
      return;
    }

    if (event.key === 'Escape' && showBookmarkSearchResults) {
      event.preventDefault();
      dismissBookmarkSearchResults();
    }
  }

  async function activateBookmarkSearchResult(item: SearchIndexItem) {
    bookmarkSearchDismissed = true;
    activeBookmarkSearchOptionIndex = -1;
    if (item.type === 'folder') {
      bookmarkSearchDraft = '';
      await selectFolder(item.id);
      return;
    }
    await openBookmark(item.node);
  }

  function clearBookmarkSearch() {
    bookmarkSearchDraft = '';
    activeBookmarkSearchOptionIndex = -1;
    bookmarkSearchDismissed = true;
    bookmarkSearchFocused = true;
    bookmarkSearchInputElement?.focus();
  }

  function dismissBookmarkSearchResults() {
    activeBookmarkSearchOptionIndex = -1;
    bookmarkSearchDismissed = true;
  }

  function getBookmarkSearchOptionId(item: SearchIndexItem) {
    return `bookmark-search-option-${item.type}-${encodeURIComponent(item.id)}`;
  }

  function clearFolderFilter() {
    folderFilterDraft = '';
  }

  function getFolderFilterState(folders: NavoBookmarkNode[], input: string) {
    const query = input.trim().toLowerCase();
    const visibleIds: string[] = [];
    const directMatches: string[] = [];
    if (!query) return { visibleIds: undefined, directMatches };

    function addUnique(list: string[], id: string) {
      if (!list.includes(id)) list.push(id);
    }

    function walk(list: NavoBookmarkNode[], ancestorIds: string[]) {
      for (const folder of list) {
        const pathIds = [...ancestorIds, folder.id];
        if (folder.title.toLowerCase().includes(query)) {
          addUnique(directMatches, folder.id);
          for (const id of pathIds) addUnique(visibleIds, id);
        }
        walk(getFolderChildren(folder).folders, pathIds);
      }
    }

    walk(folders, []);
    return { visibleIds, directMatches };
  }

  function getFaviconUrlCandidates(url?: string) {
    if (!url) return [];
    try {
      const parsed = new URL(url);
      if (!['http:', 'https:'].includes(parsed.protocol)) return [];
      return [
        browserApi.runtime.getUrl(`/_favicon/?pageUrl=${encodeURIComponent(parsed.href)}&size=32`),
        `${parsed.origin}/favicon.ico`,
        `https://www.google.com/s2/favicons?domain=${encodeURIComponent(parsed.hostname)}&sz=32`,
        `https://icons.duckduckgo.com/ip3/${parsed.hostname}.ico`,
      ];
    } catch {
      return [];
    }
  }

  function handleFaviconLoad(event: Event) {
    (event.currentTarget as HTMLImageElement).classList.add('loaded');
  }

  function handleFaviconError(event: Event) {
    const image = event.currentTarget as HTMLImageElement;
    const sources = image.dataset.sources?.split('\n') ?? [];
    const nextIndex = Number(image.dataset.index ?? '0') + 1;
    if (sources[nextIndex]) {
      image.dataset.index = String(nextIndex);
      image.src = sources[nextIndex];
    } else image.classList.add('failed');
  }

  function getVisibleFolderRows(
    folders: NavoBookmarkNode[],
    expandedIds: string[],
    activeId?: string,
    depth = 0,
    filterVisibleIds?: string[],
    directMatches: string[] = [],
  ): VisibleFolderRow[] {
    const rows: VisibleFolderRow[] = [];
    for (const folder of folders) {
      if (filterVisibleIds && !filterVisibleIds.includes(folder.id)) continue;
      const childFolders = getFolderChildren(folder).folders;
      const expanded = filterVisibleIds ? childFolders.some((child) => filterVisibleIds.includes(child.id)) : expandedIds.includes(folder.id);
      rows.push({
        folder,
        depth,
        childFolderCount: childFolders.length,
        expanded,
        selected: activeId === folder.id,
        matched: directMatches.includes(folder.id),
      });
      if (expanded) {
        rows.push(...getVisibleFolderRows(childFolders, expandedIds, activeId, depth + 1, filterVisibleIds, directMatches));
      }
    }
    return rows;
  }

  function getDefaultExpandedFolderIds(tree: NavoBookmarkNode[], activeId?: string) {
    const ids = getEffectiveRootFolders(tree).map((folder) => folder.id);
    return activeId ? addSelectedPath(ids, tree, activeId) : ids;
  }

  function addSelectedPath(ids: string[], tree: NavoBookmarkNode[], activeId: string) {
    let nextIds = ids;
    for (const node of getPathNodes(tree, activeId)) {
      if (node.type === 'folder' && !nextIds.includes(node.id)) nextIds = [...nextIds, node.id];
    }
    return nextIds;
  }

  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
</script>

<svelte:window onkeydown={(event) => event.key === 'Escape' && closeEditor()} />

<div class="app-shell" data-theme={theme}>
  <header class="app-header">
    <button type="button" class="brand" aria-label="Navo 首页" onclick={() => setActiveView('home')}>
      <span class="brand-mark" aria-hidden="true">N</span>
      <span class="brand-copy"><strong>Navo</strong><small>书签工作台</small></span>
    </button>
    <nav class="top-menu" aria-label="主要视图">
      <button type="button" class:active={activeView === 'home'} aria-current={activeView === 'home' ? 'page' : undefined} onclick={() => setActiveView('home')}><Icon icon={homeIcon} width="16" />首页</button>
      <button type="button" class:active={activeView === 'bookmarks'} aria-current={activeView === 'bookmarks' ? 'page' : undefined} onclick={() => setActiveView('bookmarks')}><Icon icon={bookmarkIcon} width="16" />书签</button>
    </nav>
    <button type="button" class="theme-toggle" aria-label={theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'} disabled={!settingsInitialized} onclick={toggleTheme}><Icon icon={theme === 'dark' ? sunIcon : moonIcon} width="18" /></button>
  </header>

  {#if activeView === 'home'}
    <main class="home-page" aria-labelledby="home-title">
      <section class="home-hero">
        <h1 id="home-title">搜索，或打开你的书签</h1>
        <form
          class="search-form home-search"
          class:open={showSearchSuggestions}
          role="search"
          onsubmit={handleSearchSubmit}
        >
          <div class="search-box">
            <Icon icon={searchIcon} width="20" aria-hidden="true" />
            <input
              id="google-search"
              bind:this={searchInputElement}
              value={searchDraft}
              type="search"
              aria-label="搜索 Google 或输入网址"
              oninput={handleSearchInput}
              onkeydown={handleSearchKeydown}
              onfocus={() => {
                searchFocused = true;
                searchSuggestionsDismissed = false;
              }}
              onblur={() => setTimeout(() => searchFocused = false, 120)}
              autocomplete="off"
              spellcheck="false"
              role="combobox"
              aria-expanded={showSearchSuggestions}
              aria-controls="search-suggestions"
              aria-activedescendant={activeSearchOptionId}
              aria-autocomplete="list"
              placeholder="问问 Google 或输入网址"
            />
            {#if searchDraft.trim()}
              <button type="button" class="search-clear-button" aria-label="清空搜索" onclick={clearSearch}>
                <Icon icon={xIcon} width="17" aria-hidden="true" />
              </button>
            {/if}
          </div>
          {#if showSearchSuggestions}
            <div
              id="search-suggestions"
              class="search-suggestions"
              role="listbox"
              tabindex="-1"
              aria-label="搜索建议"
              onmousedown={(event) => event.preventDefault()}
            >
              <div class="suggestion-primary">
                <button
                  id="search-option-primary"
                  type="button"
                  class:active={activeSearchOptionIndex === 0}
                  class="suggestion-action"
                  role="option"
                  aria-selected={activeSearchOptionIndex === 0}
                  onclick={() => navigateToSearchTarget(searchDraft)}
                >
                  <Icon icon={historyIcon} width="18" aria-hidden="true" />
                  <span class="suggestion-copy">
                    <span class="suggestion-title">{searchDraft.trim()}</span>
                    <span class="suggestion-meta">- Google 搜索</span>
                  </span>
                </button>
                <button type="button" class="suggestion-clear" aria-label="清空搜索" onclick={clearSearch}>
                  <Icon icon={xIcon} width="18" aria-hidden="true" />
                </button>
              </div>
              {#each googleSuggestions as suggestion, index (suggestion)}
                <button
                  id={getSearchOptionId(index + 1)}
                  type="button"
                  class:active={activeSearchOptionIndex === index + 1}
                  class="suggestion-row"
                  role="option"
                  aria-selected={activeSearchOptionIndex === index + 1}
                  onclick={() => navigateToSearchTarget(suggestion)}
                >
                  <Icon class="suggestion-icon" icon={searchIcon} width="18" aria-hidden="true" />
                  <span class="suggestion-copy"><span class="suggestion-title">{suggestion}</span></span>
                </button>
              {/each}
            </div>
          {/if}
        </form>
      </section>

      {#if actionError}<p class="action-error home-action-error" role="alert">{actionError}</p>{/if}
      {#if status === 'error'}
        <section class="state-panel error-state"><Icon icon={alertCircleIcon} width="22" /><div><h2>加载书签失败。</h2><p>{errorMessage}</p><button type="button" class="state-action" onclick={loadWorkspace}>重试</button></div></section>
      {:else}
        <section class="home-section" aria-labelledby="fixed-title">
          <div class="section-heading"><div><p class="section-label">固定区</p><h2 id="fixed-title">我的固定</h2></div><button type="button" class="text-button" onclick={() => setActiveView('bookmarks')}>前往整理</button></div>
          {#if status === 'loading'}<div class="bookmark-grid loading"><span></span><span></span><span></span></div>
          {:else if fixedBookmarks.length === 0}<p class="inline-empty">还没有固定书签。进入书签页并开启整理模式即可固定最多 8 项。</p>
          {:else}<div class="bookmark-grid">{#each fixedBookmarks as bookmark (bookmark.id)}{@render BookmarkButton(bookmark)}{/each}</div>{/if}
        </section>
        <section class="home-section" aria-labelledby="recent-title">
          <div class="section-heading"><div><p class="section-label">活动记录</p><h2 id="recent-title">最近打开</h2></div></div>
          {#if recentBookmarks.length === 0}<p class="inline-empty">从 Navo 打开的书签会按最近时间显示在这里。</p>
          {:else}<div class="bookmark-grid">{#each recentBookmarks as bookmark (bookmark.id)}{@render BookmarkButton(bookmark)}{/each}</div>{/if}
        </section>
      {/if}
    </main>
  {:else}
    <div class:collapsed={sidebarCollapsed} class="workspace">
      {#if sidebarCollapsed}<button type="button" class="sidebar-restore" aria-label="显示目录索引" disabled={!settingsInitialized} onclick={toggleSidebarCollapsed}><Icon icon={panelLeftOpenIcon} width="18" /></button>{/if}
      <aside class="sidebar" aria-label="文件夹目录索引">
        <div class="sidebar-heading"><div><strong>目录索引</strong><small>{folderSections.length} 个文件夹</small></div><button type="button" class="icon-button" aria-label="隐藏目录索引" disabled={!settingsInitialized} onclick={toggleSidebarCollapsed}><Icon icon={panelLeftCloseIcon} width="18" /></button></div>
        <p class="sidebar-hint">滚动右侧会同步高亮，点击目录可快速定位。</p>
        <div class="folder-filter">
          <Icon icon={searchIcon} width="15" aria-hidden="true" />
          <input
            type="search"
            value={folderFilterDraft}
            aria-label="筛选文件夹"
            placeholder="筛选文件夹"
            autocomplete="off"
            oninput={(event) => folderFilterDraft = event.currentTarget.value}
          />
          {#if folderFilterDraft.trim()}
            <button type="button" aria-label="清空文件夹筛选" onclick={clearFolderFilter}><Icon icon={xIcon} width="15" aria-hidden="true" /></button>
          {/if}
        </div>
        <nav class="folder-tree" aria-label="文件夹目录">
          {#if folderFilterDraft.trim() && visibleFolderRows.length === 0}
            <p class="folder-filter-empty">没有匹配的文件夹</p>
          {:else}
            {#each visibleFolderRows as row (row.folder.id)}
              <div use:registerSidebarRow={row.folder.id} class:active={row.selected} class:matched={row.matched} class="folder-row" style={`--depth:${row.depth}`}>
                <button type="button" class:empty={row.childFolderCount === 0} class:filter-locked={Boolean(folderFilterDraft.trim())} class="folder-toggle-button" disabled={row.childFolderCount === 0 || Boolean(folderFilterDraft.trim())} aria-label={row.expanded ? `收起 ${row.folder.title}` : `展开 ${row.folder.title}`} aria-expanded={row.childFolderCount ? row.expanded : undefined} onclick={() => toggleFolder(row.folder.id)}><Icon class={row.expanded ? 'expanded' : ''} icon={chevronRightIcon} width="14" /></button>
                <button type="button" class="folder-select" aria-current={row.selected ? 'location' : undefined} onclick={() => selectFolder(row.folder.id)}><Icon icon={folderIcon} width="16" /><span>{row.folder.title}</span><small>{getDirectChildCount(row.folder)}</small></button>
              </div>
            {/each}
          {/if}
        </nav>
      </aside>

      <main bind:this={contentScroller} class="content" aria-labelledby="overview-title">
        {#if status === 'loading'}<section class="state-panel"><Icon icon={searchIcon} width="22" /><div><h1>正在加载书签...</h1></div></section>
        {:else if status === 'error'}<section class="state-panel error-state"><Icon icon={alertCircleIcon} width="22" /><div><h1>加载书签失败。</h1><p>{errorMessage}</p><button type="button" class="state-action" onclick={loadWorkspace}>重试</button></div></section>
        {:else if status === 'empty'}<section class="state-panel"><Icon icon={fileQuestionIcon} width="22" /><div><h1>还没有书签文件夹。</h1></div></section>
        {:else}
          <header class="overview-header">
            <div><p class="section-label">书签总览</p><h1 id="overview-title">全部书签</h1><p>{folderSections.length} 个文件夹 / {allBookmarks.length} 个书签</p></div>
            <button type="button" class:active={organizeMode} class="organize-toggle" aria-pressed={organizeMode} disabled={!settingsInitialized || isMutationLocked()} onclick={toggleOrganizeMode}>{organizeMode ? '完成整理' : '整理书签'}</button>
          </header>
          <div class="bookmark-locator" class:open={showBookmarkSearchResults}>
            <label for="bookmark-locator-input">快速定位</label>
            <div class="bookmark-locator-box">
              <Icon icon={searchIcon} width="18" aria-hidden="true" />
              <input
                id="bookmark-locator-input"
                bind:this={bookmarkSearchInputElement}
                type="search"
                value={bookmarkSearchDraft}
                placeholder="搜索文件夹、书签、网址或路径"
                autocomplete="off"
                spellcheck="false"
                role="combobox"
                aria-autocomplete="list"
                aria-expanded={showBookmarkSearchResults}
                aria-controls="bookmark-locator-results"
                aria-activedescendant={activeBookmarkSearchOptionId}
                oninput={handleBookmarkSearchInput}
                onkeydown={handleBookmarkSearchKeydown}
                onfocus={() => {
                  bookmarkSearchFocused = true;
                  bookmarkSearchDismissed = false;
                }}
                onblur={() => setTimeout(() => bookmarkSearchFocused = false, 120)}
              />
              {#if bookmarkSearchDraft.trim()}
                <button type="button" class="bookmark-locator-clear" aria-label="清空快速定位" onclick={clearBookmarkSearch}><Icon icon={xIcon} width="16" aria-hidden="true" /></button>
              {/if}
            </div>
            {#if showBookmarkSearchResults}
              <div id="bookmark-locator-results" class="bookmark-locator-results" role="listbox" aria-label="书签快速定位结果" tabindex="-1" onmousedown={(event) => event.preventDefault()}>
                {#if bookmarkSearchOptions.length === 0}
                  <div class="bookmark-locator-empty"><Icon icon={searchIcon} width="18" aria-hidden="true" /><span>没有匹配的文件夹或书签</span></div>
                {:else}
                  {#if bookmarkFolderResults.length > 0}
                    <div class="bookmark-result-group" role="group" aria-label="文件夹">
                      <p>文件夹</p>
                      {#each bookmarkFolderResults as item (item.id)}
                        {@const optionIndex = bookmarkSearchOptions.findIndex((option) => option.id === getBookmarkSearchOptionId(item))}
                        <button id={getBookmarkSearchOptionId(item)} type="button" class:active={activeBookmarkSearchOptionIndex === optionIndex} class="bookmark-result-row" role="option" aria-selected={activeBookmarkSearchOptionIndex === optionIndex} onclick={() => activateBookmarkSearchResult(item)}>
                          <span class="bookmark-result-icon folder"><Icon icon={folderIcon} width="17" aria-hidden="true" /></span>
                          <span class="bookmark-result-copy"><strong>{item.title}</strong><small>{item.pathText}</small></span>
                        </button>
                      {/each}
                    </div>
                  {/if}
                  {#if bookmarkResults.length > 0}
                    <div class="bookmark-result-group" role="group" aria-label="书签">
                      <p>书签</p>
                      {#each bookmarkResults as item (item.id)}
                        {@const optionIndex = bookmarkSearchOptions.findIndex((option) => option.id === getBookmarkSearchOptionId(item))}
                        {@const faviconUrls = getFaviconUrlCandidates(item.url)}
                        <button id={getBookmarkSearchOptionId(item)} type="button" class:active={activeBookmarkSearchOptionIndex === optionIndex} class="bookmark-result-row" role="option" aria-selected={activeBookmarkSearchOptionIndex === optionIndex} onclick={() => activateBookmarkSearchResult(item)}>
                          <span class="bookmark-result-icon" aria-hidden="true"><Icon icon={bookmarkIcon} width="16" />{#if faviconUrls[0]}<img src={faviconUrls[0]} data-index="0" data-sources={faviconUrls.join('\n')} alt="" loading="lazy" onload={handleFaviconLoad} onerror={handleFaviconError} />{/if}</span>
                          <span class="bookmark-result-copy"><strong>{item.title}</strong><small>{item.domain ?? getDisplayUrl(item.url ?? '')} · {item.pathText}</small></span>
                        </button>
                      {/each}
                    </div>
                  {/if}
                {/if}
              </div>
            {/if}
          </div>
          {#if actionError}<p class="action-error" role="alert">{actionError}</p>{/if}

          {#if organizeMode}
            <section class="fixed-manager" aria-labelledby="fixed-manager-title">
              <div class="section-heading"><div><p class="section-label">首页展示</p><h2 id="fixed-manager-title">固定区管理</h2></div><small>{settings.fixedBookmarkIds.length} / {fixedBookmarkLimit}</small></div>
              {#if settings.fixedBookmarkIds.length >= fixedBookmarkLimit}<p class="fixed-limit-note" role="status">固定区已满（最多 8 项）。请先移除一项，再固定新的书签。</p>{/if}
              {#if fixedBookmarks.length === 0}<p class="inline-empty">在下方书签行点击“固定”添加项目。</p>
              {:else}<ol>{#each fixedBookmarks as bookmark, index (bookmark.id)}<li><span>{bookmark.title}</span><div><button type="button" disabled={!settingsInitialized || isMutationLocked() || index === 0} aria-label={`前移 ${bookmark.title}`} onclick={() => moveFixedBookmark(index, -1)}>↑</button><button type="button" disabled={!settingsInitialized || isMutationLocked() || index === fixedBookmarks.length - 1} aria-label={`后移 ${bookmark.title}`} onclick={() => moveFixedBookmark(index, 1)}>↓</button><button type="button" disabled={!settingsInitialized || isMutationLocked()} aria-label={`取消固定 ${bookmark.title}`} onclick={() => toggleFixedBookmark(bookmark.id)}>移除</button></div></li>{/each}</ol>{/if}
            </section>
          {/if}

          <div class="folder-overview">
            {#each folderSections as section (section.folder.id)}
              <section use:registerSection={section.folder.id} data-folder-id={section.folder.id} class:visible={visibleFolderId === section.folder.id} class:jump-target={jumpTargetFolderId === section.folder.id} class="folder-section">
                <header class="folder-section-header">
                  <div><h2 class="folder-section-title" tabindex="-1">{section.folder.title}</h2><p title={section.path.map((node) => node.title).join(' / ')}>{section.path.map((node) => node.title).join(' / ')} · {section.bookmarks.length} 个直接书签</p></div>
                  {#if organizeMode}<div class="folder-actions"><button type="button" disabled={!settingsInitialized || isMutationLocked()} aria-label={`在 ${section.folder.title} 中新建文件夹`} onclick={() => openCreateFolderEditor(section.folder.id)}><Icon icon={folderPlusIcon} width="16" /></button><button type="button" disabled={!settingsInitialized || isMutationLocked()} aria-label={`在 ${section.folder.title} 中新建书签`} onclick={() => openCreateBookmarkEditor(section.folder.id)}><Icon icon={bookmarkPlusIcon} width="16" /></button><button type="button" disabled={!settingsInitialized || isMutationLocked() || !canModifyBookmarkNode(section.folder)} aria-label={`编辑文件夹 ${section.folder.title}`} onclick={() => openEditFolderEditor(section.folder)}><Icon icon={pencilIcon} width="15" /></button><button type="button" disabled={!settingsInitialized || isMutationLocked() || !canModifyBookmarkNode(section.folder)} aria-label={`删除文件夹 ${section.folder.title}`} onclick={() => deleteFolderItem(section.folder)}><Icon icon={trashIcon} width="15" /></button></div>{/if}
                </header>
                {#if section.bookmarks.length === 0}<p class="folder-empty">空文件夹{organizeMode ? '，可使用上方按钮添加内容。' : ''}</p>
                {:else}<div class="section-bookmark-grid">{#each section.bookmarks as bookmark (bookmark.id)}<article class="bookmark-row">{@render BookmarkButton(bookmark, true)}{#if organizeMode}<div class="row-actions"><button type="button" class:active={isFixed(bookmark.id)} aria-pressed={isFixed(bookmark.id)} disabled={!settingsInitialized || isMutationLocked() || (!isFixed(bookmark.id) && settings.fixedBookmarkIds.length >= fixedBookmarkLimit)} aria-label={isFixed(bookmark.id) ? `取消固定 ${bookmark.title}` : `固定 ${bookmark.title}`} onclick={() => toggleFixedBookmark(bookmark.id)}>{isFixed(bookmark.id) ? '取消固定' : '固定'}</button><button type="button" disabled={!settingsInitialized || isMutationLocked()} aria-label={`编辑书签 ${bookmark.title}`} onclick={() => openEditBookmarkEditor(bookmark)}><Icon icon={pencilIcon} width="14" /></button><button type="button" disabled={!settingsInitialized || isMutationLocked()} aria-label={`删除书签 ${bookmark.title}`} onclick={() => deleteBookmarkItem(bookmark)}><Icon icon={trashIcon} width="14" /></button></div>{/if}</article>{/each}</div>{/if}
              </section>
            {/each}
          </div>
        {/if}
      </main>
    </div>
  {/if}
</div>

{#snippet BookmarkButton(bookmark: NavoBookmarkNode, compact = false)}
  {@const faviconUrls = getFaviconUrlCandidates(bookmark.url)}
  <button type="button" class:compact class="bookmark-button" title={`${bookmark.title} — ${bookmark.domain ?? getDisplayUrl(bookmark.url ?? '')}`} aria-label={`打开书签 ${bookmark.title}`} disabled={!settingsInitialized} onclick={() => openBookmark(bookmark)}>
    <span class="site-icon" aria-hidden="true"><Icon icon={bookmarkIcon} width="17" />{#if faviconUrls[0]}<img src={faviconUrls[0]} data-index="0" data-sources={faviconUrls.join('\n')} alt="" loading="lazy" onload={handleFaviconLoad} onerror={handleFaviconError} />{/if}</span>
    <span class="bookmark-copy"><strong>{bookmark.title}</strong><small>{bookmark.domain ?? getDisplayUrl(bookmark.url ?? '')}</small></span>
  </button>
{/snippet}

{#if editorState}
  <div class="editor-overlay">
    <div class="editor-dialog" role="dialog" aria-modal="true" aria-labelledby="editor-title">
      <form onsubmit={submitBookmarkEditor}>
        <header><div><p class="section-label">{editorState.kind === 'folder' ? '文件夹' : '书签'}</p><h2 id="editor-title">{editorState.mode === 'create' ? '新建' : '编辑'}{editorState.kind === 'folder' ? '文件夹' : '书签'}</h2></div><button type="button" aria-label="关闭编辑器" onclick={closeEditor}><Icon icon={xIcon} width="16" /></button></header>
        <label><span>名称</span><input value={editorState.title} oninput={(event) => updateEditorState({ title: event.currentTarget.value, error: '' })} autocomplete="off" /></label>
        {#if editorState.kind === 'bookmark'}<label><span>网址</span><input value={editorState.url} oninput={(event) => updateEditorState({ url: event.currentTarget.value, error: '' })} inputmode="url" autocomplete="url" /></label>{/if}
        {#if editorState.error}<p class="editor-error" role="alert">{editorState.error}</p>{/if}
        <footer><button type="button" disabled={editorState.saving} onclick={closeEditor}>取消</button><button type="submit" class="primary" disabled={editorState.saving}>{editorState.saving ? '正在保存...' : '保存'}</button></footer>
      </form>
    </div>
  </div>
{/if}
