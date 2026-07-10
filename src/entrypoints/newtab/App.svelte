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
  import { onMount } from 'svelte';
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
  import {
    findFolderById,
    getChildTypeCounts,
    getDirectChildCount,
    getEffectiveRootFolders,
    getFirstFolder,
    getFolderChildren,
    getPathNodes,
  } from '../../utils/tree';
  import { getDisplayUrl, getSearchNavigationTarget } from '../../utils/url';

  type LoadStatus = 'loading' | 'ready' | 'empty' | 'error';
  type ActiveView = 'home' | 'bookmarks';

  interface VisibleFolderRow {
    folder: NavoBookmarkNode;
    depth: number;
    childFolderCount: number;
    expanded: boolean;
    selected: boolean;
  }

  interface QuickNavigationItem {
    bookmark: NavoBookmarkNode;
    clickCount: number;
  }

  type EditorMode = 'create' | 'edit';
  type EditorKind = 'folder' | 'bookmark';

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

  const googleSuggestionLimit = 9;
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
  let searchInputElement: HTMLInputElement | undefined;
  let searchDraft = '';
  let searchFocused = false;
  let status: LoadStatus = 'loading';
  let errorMessage = '';
  let settings: NavoLocalSettings = { ...defaultSettings };
  let sidebarCollapsed = defaultSettings.sidebarCollapsed;
  let bookmarkClickCounts: Record<string, number> = {
    ...defaultSettings.bookmarkClickCounts,
  };
  let bookmarkTree: NavoBookmarkNode[] = [];
  let selectedFolderId: string | undefined;
  let expandedFolderIds: string[] = [];
  let editorState: BookmarkEditorState | undefined;
  let actionError = '';
  let mutating = false;

  let rootFolders: NavoBookmarkNode[] = [];
  let visibleFolderRows: VisibleFolderRow[] = [];
  let selectedFolder: NavoBookmarkNode | undefined;
  let childFolders: NavoBookmarkNode[] = [];
  let childBookmarks: NavoBookmarkNode[] = [];
  let pathNodes: NavoBookmarkNode[] = [];
  let folderCount = 0;
  let bookmarkCount = 0;
  let googleSuggestions: string[] = [];
  let hasSearchDraft = false;
  let showSearchSuggestions = false;
  let selectedFolderCanModify = false;
  let quickNavigationItems: QuickNavigationItem[] = [];

  $: rootFolders = getEffectiveRootFolders(bookmarkTree);
  $: visibleFolderRows = getVisibleFolderRows(
    rootFolders,
    expandedFolderIds,
    selectedFolderId,
  );
  $: selectedFolder = selectedFolderId
    ? findFolderById(bookmarkTree, selectedFolderId)
    : undefined;
  $: ({ folders: childFolders, bookmarks: childBookmarks } =
    getFolderChildren(selectedFolder));
  $: ({ folderCount, bookmarkCount } = getChildTypeCounts(selectedFolder));
  $: pathNodes = selectedFolderId
    ? getPathNodes(bookmarkTree, selectedFolderId).filter((node) => node.title)
    : [];
  $: googleSuggestions = getGoogleSuggestions(searchDraft);
  $: hasSearchDraft = searchDraft.trim().length > 0;
  $: showSearchSuggestions = searchFocused && hasSearchDraft;
  $: selectedFolderCanModify = selectedFolder
    ? canModifyBookmarkNode(selectedFolder)
    : false;
  $: quickNavigationItems = getQuickNavigationItems(
    bookmarkTree,
    bookmarkClickCounts,
  );

  onMount(() => {
    void loadWorkspace();
  });

  async function loadWorkspace() {
    status = 'loading';
    errorMessage = '';
    actionError = '';

    try {
      const [loadedSettings, loadedTree] = await Promise.all([
        getSettings(),
        getBookmarkTree(),
      ]);
      const savedFolder = loadedSettings.lastSelectedFolderId
        ? findFolderById(loadedTree, loadedSettings.lastSelectedFolderId)
        : undefined;
      const fallbackFolder = savedFolder ?? getFirstFolder(loadedTree);

      settings = loadedSettings;
      theme = loadedSettings.theme;
      sidebarCollapsed = loadedSettings.sidebarCollapsed;
      bookmarkClickCounts = loadedSettings.bookmarkClickCounts;
      bookmarkTree = loadedTree;
      selectedFolderId = fallbackFolder?.id;
      expandedFolderIds = getDefaultExpandedFolderIds(
        loadedTree,
        fallbackFolder?.id,
      );
      status = fallbackFolder ? 'ready' : 'empty';
    } catch (error) {
      status = 'error';
      errorMessage =
        error instanceof Error ? error.message : '加载书签失败。';
    }
  }

  async function refreshBookmarkTree(preferredFolderId?: string) {
    const loadedTree = await getBookmarkTree();
    const preferredFolder = preferredFolderId
      ? findFolderById(loadedTree, preferredFolderId)
      : undefined;
    const currentFolder = selectedFolderId
      ? findFolderById(loadedTree, selectedFolderId)
      : undefined;
    const fallbackFolder = preferredFolder ?? currentFolder ?? getFirstFolder(loadedTree);

    bookmarkTree = loadedTree;
    selectedFolderId = fallbackFolder?.id;
    expandedFolderIds = fallbackFolder?.id
      ? addSelectedPath(expandedFolderIds, loadedTree, fallbackFolder.id)
      : getDefaultExpandedFolderIds(loadedTree);
    status = fallbackFolder ? 'ready' : 'empty';
  }

  function openCreateFolderEditor(parentId: string) {
    actionError = '';
    editorState = {
      mode: 'create',
      kind: 'folder',
      parentId,
      title: '',
      url: '',
      error: '',
      saving: false,
    };
  }

  function openCreateBookmarkEditor(parentId: string) {
    actionError = '';
    editorState = {
      mode: 'create',
      kind: 'bookmark',
      parentId,
      title: '',
      url: '',
      error: '',
      saving: false,
    };
  }

  function openEditFolderEditor(folder: NavoBookmarkNode) {
    if (!canModifyBookmarkNode(folder)) {
      actionError = '这个浏览器管理的文件夹不能编辑。';
      return;
    }

    actionError = '';
    editorState = {
      mode: 'edit',
      kind: 'folder',
      targetId: folder.id,
      title: folder.title,
      url: '',
      error: '',
      saving: false,
    };
  }

  function openEditBookmarkEditor(bookmark: NavoBookmarkNode) {
    actionError = '';
    editorState = {
      mode: 'edit',
      kind: 'bookmark',
      targetId: bookmark.id,
      title: bookmark.title,
      url: bookmark.url ?? '',
      error: '',
      saving: false,
    };
  }

  function closeEditor() {
    if (editorState?.saving) return;

    editorState = undefined;
  }

  function handleEditorTitleInput(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    updateEditorState({ title: input.value, error: '' });
  }

  function handleEditorUrlInput(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    updateEditorState({ url: input.value, error: '' });
  }

  function updateEditorState(changes: Partial<BookmarkEditorState>) {
    if (!editorState) return;

    editorState = { ...editorState, ...changes };
  }

  async function submitBookmarkEditor(event: SubmitEvent) {
    event.preventDefault();
    if (!editorState) return;

    const title = editorState.title.trim();
    const url = editorState.url.trim();
    const validationError = getEditorValidationError(editorState, title, url);

    if (validationError) {
      updateEditorState({ error: validationError });
      return;
    }

    updateEditorState({ saving: true, error: '' });
    actionError = '';

    try {
      if (editorState.mode === 'create' && editorState.kind === 'folder') {
        if (!editorState.parentId) throw new Error('没有选择父文件夹。');

        const createdId = await createFolder({
          parentId: editorState.parentId,
          title,
        });
        await refreshBookmarkTree(createdId);
        editorState = undefined;
        return;
      }

      if (editorState.mode === 'create' && editorState.kind === 'bookmark') {
        if (!editorState.parentId) throw new Error('没有选择父文件夹。');

        await createBookmark({
          parentId: editorState.parentId,
          title,
          url,
        });
        const parentId = editorState.parentId;
        await refreshBookmarkTree(parentId);
        editorState = undefined;
        return;
      }

      if (editorState.mode === 'edit' && editorState.kind === 'folder') {
        if (!editorState.targetId) throw new Error('没有选择文件夹。');

        await updateFolder({
          id: editorState.targetId,
          title,
        });
        const targetId = editorState.targetId;
        await refreshBookmarkTree(targetId);
        editorState = undefined;
        return;
      }

      if (!editorState.targetId) throw new Error('没有选择书签。');

      await updateBookmark({
        id: editorState.targetId,
        title,
        url,
      });
      await refreshBookmarkTree(selectedFolderId);
      editorState = undefined;
    } catch (error) {
      updateEditorState({
        saving: false,
        error:
          error instanceof Error ? error.message : '保存失败。',
      });
    }
  }

  async function deleteBookmarkItem(bookmark: NavoBookmarkNode) {
    if (!confirm(`删除书签“${bookmark.title}”？`)) return;

    await runBookmarkMutation(async () => {
      await deleteBookmark(bookmark.id);
      await refreshBookmarkTree(selectedFolderId);
    });
  }

  async function deleteFolderItem(folder: NavoBookmarkNode) {
    if (!canModifyBookmarkNode(folder)) {
      actionError = '这个浏览器管理的文件夹不能删除。';
      return;
    }

    if (!confirm(`删除文件夹“${folder.title}”以及其中的所有内容？`)) {
      return;
    }

    const fallbackFolderId =
      selectedFolderId === folder.id ? folder.parentId : selectedFolderId;

    await runBookmarkMutation(async () => {
      await deleteFolder(folder.id);
      await refreshBookmarkTree(fallbackFolderId);
    });
  }

  async function runBookmarkMutation(action: () => Promise<void>) {
    if (mutating) return;

    mutating = true;
    actionError = '';

    try {
      await action();
    } catch (error) {
      actionError =
        error instanceof Error ? error.message : '书签操作失败。';
    } finally {
      mutating = false;
    }
  }

  function getEditorValidationError(
    state: BookmarkEditorState,
    title: string,
    url: string,
  ): string {
    if (!title) return '请输入名称。';
    if (state.kind !== 'bookmark') return '';
    if (!url) return '请输入网址。';

    return '';
  }

  function canModifyBookmarkNode(node: NavoBookmarkNode): boolean {
    return node.parentId !== undefined && node.parentId !== '0';
  }

  function handleWindowKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') closeEditor();
  }

  function handleSearchInput(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    searchDraft = input.value;
    searchFocused = true;
  }

  function handleSearchSubmit(event: SubmitEvent) {
    event.preventDefault();
    navigateToSearchTarget(searchDraft);
  }

  function handleSearchFocus() {
    searchFocused = true;
  }

  function handleSearchBlur() {
    setTimeout(() => {
      searchFocused = false;
    }, 120);
  }

  function handleSuggestionsMouseDown(event: MouseEvent) {
    event.preventDefault();
  }

  function navigateToSearchTarget(input: string) {
    const targetUrl = getSearchNavigationTarget(input);
    if (!targetUrl) return;

    window.location.assign(targetUrl);
  }

  function setActiveView(nextView: ActiveView) {
    activeView = nextView;
  }

  async function openBookmark(bookmark: NavoBookmarkNode) {
    if (!bookmark.url) return;

    const nextBookmarkClickCounts = {
      ...bookmarkClickCounts,
      [bookmark.id]: (bookmarkClickCounts[bookmark.id] ?? 0) + 1,
    };
    bookmarkClickCounts = nextBookmarkClickCounts;

    try {
      await persistSettings(
        {
          ...settings,
          bookmarkClickCounts: nextBookmarkClickCounts,
        },
        { ignoreErrors: false },
      );
    } catch {
      actionError = '打开书签前保存点击次数失败，请重试。';
      return;
    }

    window.location.assign(bookmark.url);
  }

  function clearSearchFromSuggestions(event: MouseEvent) {
    event.stopPropagation();
    clearSearch();
    searchFocused = true;
    searchInputElement?.focus();
  }

  function clearSearch() {
    searchDraft = '';
  }

  function getGoogleSuggestions(input: string): string[] {
    const query = input.trim();
    if (!query) return [];

    const lowerQuery = query.toLowerCase();
    const seededSuggestions = commonGoogleSuggestions.filter(
      (suggestion) =>
        suggestion.toLowerCase().startsWith(lowerQuery) &&
        suggestion.toLowerCase() !== lowerQuery,
    );
    const generatedSuggestions = googleSuggestionSuffixes.map(
      (suffix) => `${query} ${suffix}`,
    );

    return getUniqueStrings([...seededSuggestions, ...generatedSuggestions]).slice(
      0,
      googleSuggestionLimit,
    );
  }

  function getUniqueStrings(values: string[]): string[] {
    const uniqueValues: string[] = [];

    for (const value of values) {
      if (!uniqueValues.includes(value)) {
        uniqueValues.push(value);
      }
    }

    return uniqueValues;
  }

  function setTheme(nextTheme: ThemeMode) {
    theme = nextTheme;
    void persistSettings({ ...settings, theme: nextTheme });
  }

  function toggleTheme() {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  }

  function toggleSidebarCollapsed() {
    const nextSidebarCollapsed = !sidebarCollapsed;
    sidebarCollapsed = nextSidebarCollapsed;
    void persistSettings({ ...settings, sidebarCollapsed: nextSidebarCollapsed });
  }

  function selectFolder(folderId: string) {
    const folder = findFolderById(bookmarkTree, folderId);
    if (!folder) return;

    selectedFolderId = folder.id;
    expandedFolderIds = addSelectedPath(expandedFolderIds, bookmarkTree, folder.id);
    void persistSettings({ ...settings, lastSelectedFolderId: folder.id });
  }

  function toggleFolder(folderId: string) {
    expandedFolderIds = expandedFolderIds.includes(folderId)
      ? expandedFolderIds.filter((expandedId) => expandedId !== folderId)
      : [...expandedFolderIds, folderId];
  }

  async function persistSettings(
    nextSettings: NavoLocalSettings,
    options: { ignoreErrors?: boolean } = {},
  ) {
    settings = nextSettings;
    bookmarkClickCounts = nextSettings.bookmarkClickCounts;

    try {
      await saveSettings(nextSettings);
    } catch (error) {
      if (options.ignoreErrors === false) throw error;
      // Non-critical settings persistence should not block bookmark browsing.
    }
  }

  function getFaviconUrlCandidates(url?: string): string[] {
    if (!url) return [];

    try {
      const parsedUrl = new URL(url);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) return [];

      const pageUrl = encodeURIComponent(parsedUrl.href);
      const hostname = parsedUrl.hostname;

      return [
        browserApi.runtime.getUrl(`/_favicon/?pageUrl=${pageUrl}&size=32`),
        `${parsedUrl.origin}/favicon.ico`,
        `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=32`,
        `https://icons.duckduckgo.com/ip3/${hostname}.ico`,
      ];
    } catch {
      return [];
    }
  }

  function getFaviconSourceList(urls: string[]): string {
    return urls.join('\n');
  }

  function handleFaviconLoad(event: Event) {
    const image = event.currentTarget as HTMLImageElement;

    image.parentElement?.classList.add('has-favicon');
    image.classList.add('loaded');
    image.classList.remove('failed');
  }

  function handleFaviconError(event: Event) {
    const image = event.currentTarget as HTMLImageElement;
    const sources = image.dataset.faviconSources?.split('\n') ?? [];
    const currentIndex = Number(image.dataset.faviconIndex ?? '0');
    const nextIndex = currentIndex + 1;
    const nextSource = sources[nextIndex];

    image.classList.remove('loaded');
    image.parentElement?.classList.remove('has-favicon');

    if (nextSource) {
      image.dataset.faviconIndex = String(nextIndex);
      image.classList.remove('failed');
      image.src = nextSource;
      return;
    }

    image.classList.add('failed');
  }

  function getQuickNavigationItems(
    tree: NavoBookmarkNode[],
    clickCounts: Record<string, number>,
  ): QuickNavigationItem[] {
    return getBookmarkNodes(tree)
      .map((bookmark) => ({
        bookmark,
        clickCount: clickCounts[bookmark.id] ?? 0,
      }))
      .filter((item) => item.clickCount > 0)
      .sort((first, second) => {
        const countDifference = second.clickCount - first.clickCount;
        if (countDifference !== 0) return countDifference;

        return first.bookmark.title.localeCompare(second.bookmark.title);
      })
      .slice(0, 8);
  }

  function getBookmarkNodes(nodes: NavoBookmarkNode[]): NavoBookmarkNode[] {
    const bookmarks: NavoBookmarkNode[] = [];

    for (const node of nodes) {
      if (node.type === 'bookmark' && node.url) {
        bookmarks.push(node);
      }

      if (node.children) {
        bookmarks.push(...getBookmarkNodes(node.children));
      }
    }

    return bookmarks;
  }

  function getVisibleFolderRows(
    folders: NavoBookmarkNode[],
    expandedIds: string[],
    activeFolderId?: string,
    depth = 0,
  ): VisibleFolderRow[] {
    const rows: VisibleFolderRow[] = [];

    for (const folder of folders) {
      const childFoldersForRow = getFolderChildren(folder).folders;
      const expanded = expandedIds.includes(folder.id);

      rows.push({
        folder,
        depth,
        childFolderCount: childFoldersForRow.length,
        expanded,
        selected: activeFolderId === folder.id,
      });

      if (expanded && childFoldersForRow.length > 0) {
        rows.push(
          ...getVisibleFolderRows(
            childFoldersForRow,
            expandedIds,
            activeFolderId,
            depth + 1,
          ),
        );
      }
    }

    return rows;
  }

  function getDefaultExpandedFolderIds(
    tree: NavoBookmarkNode[],
    activeFolderId?: string,
  ): string[] {
    const expandedIds = getEffectiveRootFolders(tree).map((folder) => folder.id);
    return activeFolderId ? addSelectedPath(expandedIds, tree, activeFolderId) : expandedIds;
  }

  function addSelectedPath(
    expandedIds: string[],
    tree: NavoBookmarkNode[],
    activeFolderId: string,
  ): string[] {
    let nextExpandedIds = expandedIds;

    for (const node of getPathNodes(tree, activeFolderId)) {
      if (node.type === 'folder' && !nextExpandedIds.includes(node.id)) {
        nextExpandedIds = [...nextExpandedIds, node.id];
      }
    }

    return nextExpandedIds;
  }
</script>

<svelte:window onkeydown={handleWindowKeydown} />

<div class="app-shell" data-theme={theme}>
  <header class="app-header">
    <button
      type="button"
      class="brand"
      aria-label="Navo 首页"
      onclick={() => setActiveView('home')}
    >
      <span class="brand-mark" aria-hidden="true">N</span>
      <span class="brand-copy">
        <strong>Navo</strong>
        <small>书签工作台</small>
      </span>
    </button>

    <nav class="top-menu" aria-label="主要视图">
      <button
        type="button"
        class:active={activeView === 'home'}
        aria-current={activeView === 'home' ? 'page' : undefined}
        onclick={() => setActiveView('home')}
      >
        <Icon icon={homeIcon} width="16" height="16" aria-hidden="true" />
        首页
      </button>
      <button
        type="button"
        class:active={activeView === 'bookmarks'}
        aria-current={activeView === 'bookmarks' ? 'page' : undefined}
        onclick={() => setActiveView('bookmarks')}
      >
        <Icon icon={bookmarkIcon} width="16" height="16" aria-hidden="true" />
        书签
      </button>
    </nav>

    <button
      type="button"
      class="theme-toggle"
      aria-label={theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'}
      title={theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'}
      onclick={toggleTheme}
    >
      <Icon
        icon={theme === 'dark' ? sunIcon : moonIcon}
        width="18"
        height="18"
        aria-hidden="true"
      />
    </button>
  </header>

  {#if activeView === 'home'}
    <main class="home-page" aria-labelledby="home-title">
      <section class="home-hero">
        <h1 id="home-title">搜索，或打开常用书签</h1>
        <form
          class="search-form home-search"
          class:open={showSearchSuggestions}
          role="search"
          onsubmit={handleSearchSubmit}
        >
          <div class="search-box">
            <Icon icon={searchIcon} width="20" height="20" aria-hidden="true" />
            <input
              id="google-search"
              bind:this={searchInputElement}
              value={searchDraft}
              type="search"
              aria-label="搜索 Google 或输入网址"
              oninput={handleSearchInput}
              onfocus={handleSearchFocus}
              onblur={handleSearchBlur}
              autocomplete="off"
              spellcheck="false"
              role="combobox"
              aria-expanded={showSearchSuggestions}
              aria-controls="search-suggestions"
              aria-autocomplete="list"
              placeholder="问问 Google 或输入网址"
            />
            {#if hasSearchDraft}
              <button
                type="button"
                class="search-clear-button"
                aria-label="清空搜索"
                onclick={clearSearchFromSuggestions}
              >
                <Icon icon={xIcon} width="17" height="17" aria-hidden="true" />
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
              onmousedown={handleSuggestionsMouseDown}
            >
              <div class="suggestion-primary">
                <button
                  type="button"
                  class="suggestion-action"
                  role="option"
                  aria-selected="false"
                  onclick={() => navigateToSearchTarget(searchDraft)}
                >
                  <Icon icon={historyIcon} width="18" height="18" aria-hidden="true" />
                  <span class="suggestion-copy">
                    <span class="suggestion-title">{searchDraft.trim()}</span>
                    <span class="suggestion-meta">- Google 搜索</span>
                  </span>
                </button>
                <button
                  type="button"
                  class="suggestion-clear"
                  aria-label="清空搜索"
                  onclick={clearSearchFromSuggestions}
                >
                  <Icon icon={xIcon} width="18" height="18" aria-hidden="true" />
                </button>
              </div>

              {#each googleSuggestions as suggestion (suggestion)}
                <button
                  type="button"
                  class="suggestion-row"
                  role="option"
                  aria-selected="false"
                  onclick={() => navigateToSearchTarget(suggestion)}
                >
                  <Icon class="suggestion-icon" icon={searchIcon} width="18" height="18" aria-hidden="true" />
                  <span class="suggestion-copy">
                    <span class="suggestion-title">{suggestion}</span>
                  </span>
                </button>
              {/each}
            </div>
          {/if}
        </form>
      </section>

      <section class="quick-nav" aria-labelledby="quick-nav-title">
        <div class="quick-nav-heading">
          <div>
            <p class="section-label">快速导航</p>
            <h2 id="quick-nav-title">常用书签</h2>
          </div>
          <button
            type="button"
            class="text-button"
            onclick={() => setActiveView('bookmarks')}
          >
            管理书签
          </button>
        </div>

        {#if status === 'loading'}
          <div class="quick-nav-grid" aria-label="正在加载常用书签">
            <span class="quick-nav-skeleton"></span>
            <span class="quick-nav-skeleton"></span>
            <span class="quick-nav-skeleton"></span>
          </div>
        {:else if status === 'error'}
          <section class="state-panel error-state" aria-live="polite">
            <Icon class="state-icon" icon={alertCircleIcon} width="22" height="22" aria-hidden="true" />
            <div>
              <h2>加载书签失败。</h2>
              <p>{errorMessage || '请检查扩展权限。'}</p>
              <button type="button" class="state-action" onclick={loadWorkspace}>
                重试
              </button>
            </div>
          </section>
        {:else if quickNavigationItems.length === 0}
          <section class="state-panel empty-state" aria-live="polite">
            <Icon class="state-icon" icon={bookmarkIcon} width="22" height="22" aria-hidden="true" />
            <div>
              <h2>还没有常用书签。</h2>
              <p>从 Navo 打开书签后，这里会显示点击次数最高的 8 个书签。</p>
            </div>
          </section>
        {:else}
          <div class="quick-nav-grid">
            {#each quickNavigationItems as item (item.bookmark.id)}
              {@const faviconUrls = getFaviconUrlCandidates(item.bookmark.url)}
              <button
                type="button"
                class="quick-nav-card"
                onclick={() => openBookmark(item.bookmark)}
              >
                <span class="site-icon" aria-hidden="true">
                  <Icon
                    class="site-icon-fallback"
                    icon={bookmarkIcon}
                    width="18"
                    height="18"
                    aria-hidden="true"
                  />
                  {#if faviconUrls.length > 0}
                    <img
                      class="site-favicon"
                      src={faviconUrls[0]}
                      data-favicon-index="0"
                      data-favicon-sources={getFaviconSourceList(faviconUrls)}
                      alt=""
                      loading="lazy"
                      onload={handleFaviconLoad}
                      onerror={handleFaviconError}
                    />
                  {/if}
                </span>
                <span class="quick-nav-copy">
                  <span class="card-title">{item.bookmark.title}</span>
                  <span class="card-detail">
                    {item.bookmark.url ? getDisplayUrl(item.bookmark.url) : '未知网址'}
                  </span>
                </span>
                <span class="quick-nav-count">{item.clickCount}</span>
              </button>
            {/each}
          </div>
        {/if}
      </section>
    </main>
  {:else}
  <div
    class="workspace"
    class:collapsed={sidebarCollapsed}
    aria-label="书签工作台"
  >
    {#if sidebarCollapsed}
      <button
        type="button"
        class="sidebar-toggle sidebar-restore"
        aria-label="显示文件夹"
        aria-pressed={sidebarCollapsed}
        title="显示文件夹"
        onclick={toggleSidebarCollapsed}
      >
        <Icon icon={panelLeftOpenIcon} width="18" height="18" aria-hidden="true" />
      </button>
    {/if}

    <aside class="sidebar" aria-label="书签文件夹">
      <div class="sidebar-heading">
        <div class="sidebar-heading-copy">
          <span>文件夹</span>
          <small>{rootFolders.length} 个根目录</small>
        </div>
        <button
          type="button"
          class="sidebar-toggle"
          aria-label="隐藏文件夹"
          aria-pressed={sidebarCollapsed}
          title="隐藏文件夹"
          onclick={toggleSidebarCollapsed}
        >
          <Icon icon={panelLeftCloseIcon} width="18" height="18" aria-hidden="true" />
        </button>
      </div>

      {#if status === 'loading'}
        <div class="loading-list" aria-label="正在加载文件夹">
          <span class="skeleton-row"></span>
          <span class="skeleton-row short"></span>
          <span class="skeleton-row"></span>
        </div>
      {:else if visibleFolderRows.length > 0}
        <nav class="folder-tree" aria-label="文件夹树">
          {#each visibleFolderRows as row (row.folder.id)}
            <div
              class:active={row.selected}
              class="folder-row"
              style={`--depth: ${row.depth}`}
            >
              <button
                type="button"
                class="folder-toggle-button"
                class:empty={row.childFolderCount === 0}
                aria-label={row.expanded
                  ? `收起 ${row.folder.title}`
                  : `展开 ${row.folder.title}`}
                aria-expanded={row.childFolderCount > 0 ? row.expanded : undefined}
                disabled={row.childFolderCount === 0}
                onclick={() => toggleFolder(row.folder.id)}
              >
                <Icon
                  class={row.expanded ? 'folder-toggle expanded' : 'folder-toggle'}
                  icon={chevronRightIcon}
                  width="14"
                  height="14"
                  aria-hidden="true"
                />
              </button>

              <button
                type="button"
                class="folder-select"
                aria-current={row.selected ? 'page' : false}
                onclick={() => selectFolder(row.folder.id)}
              >
                <Icon class="folder-icon" icon={folderIcon} width="17" height="17" aria-hidden="true" />
                <span class="folder-title">{row.folder.title}</span>
                <span class="folder-count">{getDirectChildCount(row.folder)}</span>
              </button>
            </div>
          {/each}
        </nav>
      {:else}
        <p class="sidebar-empty">没有找到书签文件夹。</p>
      {/if}
    </aside>

    <main class="content" aria-labelledby="folder-title">
      {#if status === 'loading'}
        <section class="state-panel loading-state" aria-live="polite">
          <Icon class="state-icon" icon={searchIcon} width="22" height="22" aria-hidden="true" />
          <div>
            <h1 id="folder-title">正在加载书签...</h1>
            <p>正在准备你的书签工作台。</p>
          </div>
        </section>
      {:else if status === 'error'}
        <section class="state-panel error-state" aria-live="polite">
          <Icon class="state-icon" icon={alertCircleIcon} width="22" height="22" aria-hidden="true" />
          <div>
            <h1 id="folder-title">加载书签失败。</h1>
            <p>{errorMessage || '请检查扩展权限。'}</p>
            <button type="button" class="state-action" onclick={loadWorkspace}>
              重试
            </button>
          </div>
        </section>
      {:else if status === 'empty' || !selectedFolder}
        <section class="state-panel empty-state" aria-live="polite">
          <Icon class="state-icon" icon={fileQuestionIcon} width="22" height="22" aria-hidden="true" />
          <div>
            <h1 id="folder-title">这个文件夹是空的。</h1>
            <p>你可以先把页面保存到浏览器书签，然后在这里找到它们。</p>
          </div>
        </section>
      {:else}
        <nav class="breadcrumb" aria-label="面包屑导航">
          {#each pathNodes as node, index (node.id)}
            {#if index > 0}
              <Icon icon={chevronRightIcon} width="13" height="13" aria-hidden="true" />
            {/if}
            <button type="button" onclick={() => selectFolder(node.id)}>
              {node.title}
            </button>
          {/each}
        </nav>

        <section class="content-heading">
          <div>
            <p class="section-label">当前文件夹</p>
            <h1 id="folder-title">{selectedFolder.title}</h1>
          </div>
          <div class="content-heading-meta">
            <p class="content-meta">{folderCount} 个文件夹 / {bookmarkCount} 个书签</p>
            <div class="folder-actions" aria-label="文件夹操作">
              <button
                type="button"
                class="tool-button primary"
                disabled={mutating}
                title="新建文件夹"
                aria-label="新建文件夹"
                onclick={() => openCreateFolderEditor(selectedFolder.id)}
              >
                <Icon icon={folderPlusIcon} width="17" height="17" aria-hidden="true" />
                <span>文件夹</span>
              </button>
              <button
                type="button"
                class="tool-button primary"
                disabled={mutating}
                title="新建书签"
                aria-label="新建书签"
                onclick={() => openCreateBookmarkEditor(selectedFolder.id)}
              >
                <Icon icon={bookmarkPlusIcon} width="17" height="17" aria-hidden="true" />
                <span>书签</span>
              </button>
              <button
                type="button"
                class="icon-button"
                disabled={mutating || !selectedFolderCanModify}
                title="编辑文件夹"
                aria-label="编辑文件夹"
                onclick={() => openEditFolderEditor(selectedFolder)}
              >
                <Icon icon={pencilIcon} width="16" height="16" aria-hidden="true" />
              </button>
              <button
                type="button"
                class="icon-button danger"
                disabled={mutating || !selectedFolderCanModify}
                title="删除文件夹"
                aria-label="删除文件夹"
                onclick={() => deleteFolderItem(selectedFolder)}
              >
                <Icon icon={trashIcon} width="16" height="16" aria-hidden="true" />
              </button>
            </div>
          </div>
        </section>

        {#if actionError}
          <p class="action-error" role="alert">{actionError}</p>
        {/if}

        {#if childFolders.length === 0 && childBookmarks.length === 0}
          <section class="state-panel empty-state" aria-live="polite">
            <Icon class="state-icon" icon={fileQuestionIcon} width="22" height="22" aria-hidden="true" />
            <div>
              <h2>这个文件夹是空的。</h2>
              <p>你可以先把页面保存到浏览器书签，然后在这里找到它们。</p>
            </div>
          </section>
        {:else}
          <section class="card-grid" aria-label="文件夹内容">
            {#each childFolders as folder (folder.id)}
              <article class="content-card folder">
                <button
                  type="button"
                  class="card-main"
                  onclick={() => selectFolder(folder.id)}
                >
                  <Icon class="card-icon" icon={folderIcon} width="20" height="20" aria-hidden="true" />
                  <span class="card-body">
                    <span class="card-title">{folder.title}</span>
                    <span class="card-meta">{getDirectChildCount(folder)} 项</span>
                    <span class="card-detail">{folder.path.join(' / ')}</span>
                  </span>
                </button>
                <span class="card-actions" aria-label={`${folder.title} 的操作`}>
                  <button
                    type="button"
                    class="icon-button"
                    disabled={mutating}
                    title="编辑文件夹"
                    aria-label={`编辑文件夹 ${folder.title}`}
                    onclick={() => openEditFolderEditor(folder)}
                  >
                    <Icon icon={pencilIcon} width="15" height="15" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    class="icon-button danger"
                    disabled={mutating}
                    title="删除文件夹"
                    aria-label={`删除文件夹 ${folder.title}`}
                    onclick={() => deleteFolderItem(folder)}
                  >
                    <Icon icon={trashIcon} width="15" height="15" aria-hidden="true" />
                  </button>
                </span>
              </article>
            {/each}

            {#each childBookmarks as bookmark (bookmark.id)}
              {@const faviconUrls = getFaviconUrlCandidates(bookmark.url)}
              <article class="content-card bookmark">
                <button
                  type="button"
                  class="card-main"
                  disabled={!bookmark.url}
                  onclick={() => openBookmark(bookmark)}
                >
                  <span class="site-icon" aria-hidden="true">
                    <Icon
                      class="site-icon-fallback"
                      icon={bookmarkIcon}
                      width="18"
                      height="18"
                      aria-hidden="true"
                    />
                    {#if faviconUrls.length > 0}
                      <img
                        class="site-favicon"
                        src={faviconUrls[0]}
                        data-favicon-index="0"
                        data-favicon-sources={getFaviconSourceList(faviconUrls)}
                        alt=""
                        loading="lazy"
                        onload={handleFaviconLoad}
                        onerror={handleFaviconError}
                      />
                    {/if}
                  </span>
                  <span class="card-body">
                    <span class="card-title">{bookmark.title}</span>
                    <span class="card-detail">
                      {bookmark.url ? getDisplayUrl(bookmark.url) : '未知网址'}
                    </span>
                  </span>
                </button>
                <span class="card-actions" aria-label={`${bookmark.title} 的操作`}>
                  <button
                    type="button"
                    class="icon-button"
                    disabled={mutating}
                    title="编辑书签"
                    aria-label={`编辑书签 ${bookmark.title}`}
                    onclick={() => openEditBookmarkEditor(bookmark)}
                  >
                    <Icon icon={pencilIcon} width="15" height="15" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    class="icon-button danger"
                    disabled={mutating}
                    title="删除书签"
                    aria-label={`删除书签 ${bookmark.title}`}
                    onclick={() => deleteBookmarkItem(bookmark)}
                  >
                    <Icon icon={trashIcon} width="15" height="15" aria-hidden="true" />
                  </button>
                </span>
              </article>
            {/each}
          </section>
        {/if}
      {/if}
    </main>
  </div>
  {/if}

{#if editorState}
  <div class="editor-overlay">
    <div
      class="editor-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bookmark-editor-title"
    >
      <form class="editor-form" onsubmit={submitBookmarkEditor}>
        <header class="editor-header">
          <div>
            <p class="section-label">
              {editorState.kind === 'folder' ? '文件夹' : '书签'}
            </p>
            <h2 id="bookmark-editor-title">
              {editorState.mode === 'create' ? '新建' : '编辑'}
              {editorState.kind === 'folder' ? '文件夹' : '书签'}
            </h2>
          </div>
          <button
            type="button"
            class="icon-button editor-close-button"
            aria-label="关闭编辑器"
            onclick={closeEditor}
          >
            <Icon icon={xIcon} width="16" height="16" aria-hidden="true" />
          </button>
        </header>

        <label class="field">
          <span>名称</span>
          <input
            value={editorState.title}
            oninput={handleEditorTitleInput}
            autocomplete="off"
          />
        </label>

        {#if editorState.kind === 'bookmark'}
          <label class="field">
            <span>网址</span>
            <input
              value={editorState.url}
              oninput={handleEditorUrlInput}
              inputmode="url"
              autocomplete="url"
              placeholder="https://example.com"
            />
          </label>
        {/if}

        {#if editorState.error}
          <p class="editor-error" role="alert">{editorState.error}</p>
        {/if}

        <footer class="editor-footer">
          <button
            type="button"
            class="text-button"
            disabled={editorState.saving}
            onclick={closeEditor}
          >
            取消
          </button>
          <button
            type="submit"
            class="text-button primary"
            disabled={editorState.saving}
          >
            {editorState.saving ? '正在保存...' : '保存'}
          </button>
        </footer>
      </form>
    </div>
  </div>
{/if}
</div>
