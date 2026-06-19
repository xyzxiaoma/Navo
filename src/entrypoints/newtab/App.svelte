<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { getBookmarkTree } from '../../services/bookmark.service';
  import { defaultSettings, getSettings, saveSettings } from '../../services/storage.service';
  import type { NavoBookmarkNode } from '../../types/bookmark';
  import type { NavoLocalSettings, ThemeMode } from '../../types/settings';
  import {
    createSearchIndex,
    emptySearchResults,
    searchBookmarks,
    type GroupedSearchResults,
    type SearchIndexItem,
  } from '../../utils/search';
  import {
    findFolderById,
    getChildTypeCounts,
    getDirectChildCount,
    getEffectiveRootFolders,
    getFirstFolder,
    getFolderChildren,
    getPathNodes,
  } from '../../utils/tree';
  import { getDisplayUrl } from '../../utils/url';

  type LoadStatus = 'loading' | 'ready' | 'empty' | 'error';

  interface ThemeOption {
    value: ThemeMode;
    label: string;
  }

  interface VisibleFolderRow {
    folder: NavoBookmarkNode;
    depth: number;
    childFolderCount: number;
    expanded: boolean;
    selected: boolean;
  }

  const themeOptions: ThemeOption[] = [
    { value: 'system', label: 'System' },
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
  ];

  let theme: ThemeMode = defaultSettings.theme;
  let searchDraft = '';
  let searchQuery = '';
  let searchDebounceHandle: ReturnType<typeof setTimeout> | undefined;
  let status: LoadStatus = 'loading';
  let errorMessage = '';
  let settings: NavoLocalSettings = { ...defaultSettings };
  let sidebarCollapsed = defaultSettings.sidebarCollapsed;
  let bookmarkTree: NavoBookmarkNode[] = [];
  let searchIndex: SearchIndexItem[] = [];
  let selectedFolderId: string | undefined;
  let expandedFolderIds: string[] = [];

  let rootFolders: NavoBookmarkNode[] = [];
  let visibleFolderRows: VisibleFolderRow[] = [];
  let selectedFolder: NavoBookmarkNode | undefined;
  let childFolders: NavoBookmarkNode[] = [];
  let childBookmarks: NavoBookmarkNode[] = [];
  let pathNodes: NavoBookmarkNode[] = [];
  let folderCount = 0;
  let bookmarkCount = 0;
  let searchResults: GroupedSearchResults = emptySearchResults;
  let searchResultCount = 0;
  let hasSearchQuery = false;

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
  $: searchResults = searchBookmarks(searchIndex, searchQuery);
  $: searchResultCount =
    searchResults.folders.length + searchResults.bookmarks.length;
  $: hasSearchQuery = searchQuery.trim().length > 0;

  onMount(() => {
    void loadWorkspace();
  });

  onDestroy(() => {
    if (searchDebounceHandle) clearTimeout(searchDebounceHandle);
  });

  async function loadWorkspace() {
    status = 'loading';
    errorMessage = '';

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
      bookmarkTree = loadedTree;
      searchIndex = createSearchIndex(loadedTree);
      selectedFolderId = fallbackFolder?.id;
      expandedFolderIds = getDefaultExpandedFolderIds(
        loadedTree,
        fallbackFolder?.id,
      );
      status = fallbackFolder ? 'ready' : 'empty';
    } catch (error) {
      status = 'error';
      errorMessage =
        error instanceof Error ? error.message : 'Failed to load bookmarks.';
    }
  }

  function handleSearchInput(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    searchDraft = input.value;

    if (searchDebounceHandle) clearTimeout(searchDebounceHandle);

    searchDebounceHandle = setTimeout(() => {
      searchQuery = searchDraft.trim();
    }, 150);
  }

  function clearSearch() {
    searchDraft = '';
    searchQuery = '';

    if (searchDebounceHandle) clearTimeout(searchDebounceHandle);
  }

  function selectSearchFolder(folderId: string) {
    selectFolder(folderId);
    clearSearch();
  }

  function setTheme(nextTheme: ThemeMode) {
    theme = nextTheme;
    void persistSettings({ ...settings, theme: nextTheme });
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

  async function persistSettings(nextSettings: NavoLocalSettings) {
    settings = nextSettings;

    try {
      await saveSettings(nextSettings);
    } catch {
      // Settings persistence should not block bookmark browsing.
    }
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

<div class="app-shell" data-theme={theme}>
  <header class="app-header">
    <a class="brand" href="/newtab.html" aria-label="Navo home">
      <span class="brand-mark" aria-hidden="true">N</span>
      <span class="brand-copy">
        <strong>Navo</strong>
        <small>Bookmark workspace</small>
      </span>
    </a>

    <button
      type="button"
      class="sidebar-toggle"
      aria-label={sidebarCollapsed ? 'Show folders' : 'Hide folders'}
      aria-pressed={sidebarCollapsed}
      title={sidebarCollapsed ? 'Show folders' : 'Hide folders'}
      onclick={toggleSidebarCollapsed}
    >
      <span aria-hidden="true">{sidebarCollapsed ? '>' : '<'}</span>
    </button>

    <label class="search-box" for="bookmark-search">
      <span class="search-icon" aria-hidden="true"></span>
      <input
        id="bookmark-search"
        value={searchDraft}
        type="search"
        oninput={handleSearchInput}
        autocomplete="off"
        spellcheck="false"
        placeholder="Search bookmarks, folders, or URLs..."
      />
    </label>

    <div class="theme-control" aria-label="Theme mode">
      {#each themeOptions as option (option.value)}
        <button
          type="button"
          class:active={theme === option.value}
          aria-pressed={theme === option.value}
          onclick={() => setTheme(option.value)}
        >
          {option.label}
        </button>
      {/each}
    </div>
  </header>

  <div
    class="workspace"
    class:collapsed={sidebarCollapsed}
    aria-label="Bookmark workspace"
  >
    <aside class="sidebar" aria-label="Bookmark folders">
      <div class="sidebar-heading">
        <span>Folders</span>
        <small>{rootFolders.length} roots</small>
      </div>

      {#if status === 'loading'}
        <div class="loading-list" aria-label="Loading folders">
          <span class="skeleton-row"></span>
          <span class="skeleton-row short"></span>
          <span class="skeleton-row"></span>
        </div>
      {:else if visibleFolderRows.length > 0}
        <nav class="folder-tree" aria-label="Folder tree">
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
                  ? `Collapse ${row.folder.title}`
                  : `Expand ${row.folder.title}`}
                aria-expanded={row.childFolderCount > 0 ? row.expanded : undefined}
                disabled={row.childFolderCount === 0}
                onclick={() => toggleFolder(row.folder.id)}
              >
                <span
                  class="folder-toggle"
                  class:expanded={row.expanded}
                  aria-hidden="true"
                ></span>
              </button>

              <button
                type="button"
                class="folder-select"
                aria-current={row.selected ? 'page' : false}
                onclick={() => selectFolder(row.folder.id)}
              >
                <span class="folder-icon" aria-hidden="true"></span>
                <span class="folder-title">{row.folder.title}</span>
                <span class="folder-count">{getDirectChildCount(row.folder)}</span>
              </button>
            </div>
          {/each}
        </nav>
      {:else}
        <p class="sidebar-empty">No bookmark folders found.</p>
      {/if}
    </aside>

    <main class="content" aria-labelledby="folder-title">
      {#if status === 'loading'}
        <section class="state-panel loading-state" aria-live="polite">
          <span class="state-icon" aria-hidden="true"></span>
          <div>
            <h1 id="folder-title">Loading your bookmarks...</h1>
            <p>Preparing your bookmark workspace.</p>
          </div>
        </section>
      {:else if status === 'error'}
        <section class="state-panel error-state" aria-live="polite">
          <span class="state-icon" aria-hidden="true"></span>
          <div>
            <h1 id="folder-title">Failed to load bookmarks.</h1>
            <p>{errorMessage || 'Please check extension permissions.'}</p>
            <button type="button" class="state-action" onclick={loadWorkspace}>
              Retry
            </button>
          </div>
        </section>
      {:else if status === 'empty' || !selectedFolder}
        <section class="state-panel empty-state" aria-live="polite">
          <span class="state-icon" aria-hidden="true"></span>
          <div>
            <h1 id="folder-title">This folder is empty.</h1>
            <p>You can save pages in your browser bookmarks, then find them here.</p>
          </div>
        </section>
      {:else if hasSearchQuery}
        <section class="content-heading">
          <div>
            <p class="section-label">Search results</p>
            <h1 id="folder-title">{searchQuery}</h1>
          </div>
          <p class="content-meta">{searchResultCount} matches</p>
        </section>

        {#if searchResultCount === 0}
          <section class="state-panel empty-state" aria-live="polite">
            <span class="state-icon" aria-hidden="true"></span>
            <div>
              <h2>No results found.</h2>
              <p>Try another keyword.</p>
            </div>
          </section>
        {:else}
          <section class="search-results" aria-label="Search results">
            {#if searchResults.folders.length > 0}
              <section class="result-group" aria-labelledby="folder-results-title">
                <h2 id="folder-results-title">Folders</h2>
                <div class="result-list">
                  {#each searchResults.folders as result (result.id)}
                    <button
                      type="button"
                      class="search-result folder"
                      onclick={() => selectSearchFolder(result.id)}
                    >
                      <span class="card-icon" aria-hidden="true"></span>
                      <span class="result-body">
                        <span class="card-title">{result.title}</span>
                        <span class="card-detail">{result.pathText}</span>
                      </span>
                    </button>
                  {/each}
                </div>
              </section>
            {/if}

            {#if searchResults.bookmarks.length > 0}
              <section class="result-group" aria-labelledby="bookmark-results-title">
                <h2 id="bookmark-results-title">Bookmarks</h2>
                <div class="result-list">
                  {#each searchResults.bookmarks as result (result.id)}
                    <a class="search-result bookmark" href={result.url ?? '#'}>
                      <span class="card-icon" aria-hidden="true"></span>
                      <span class="result-body">
                        <span class="card-title">{result.title}</span>
                        <span class="card-meta">{result.domain ?? 'Unknown URL'}</span>
                        <span class="card-detail">{result.pathText}</span>
                      </span>
                    </a>
                  {/each}
                </div>
              </section>
            {/if}
          </section>
        {/if}
      {:else}
        <nav class="breadcrumb" aria-label="Breadcrumb">
          {#each pathNodes as node, index (node.id)}
            {#if index > 0}
              <span aria-hidden="true">/</span>
            {/if}
            <button type="button" onclick={() => selectFolder(node.id)}>
              {node.title}
            </button>
          {/each}
        </nav>

        <section class="content-heading">
          <div>
            <p class="section-label">Current folder</p>
            <h1 id="folder-title">{selectedFolder.title}</h1>
          </div>
          <p class="content-meta">{folderCount} folders / {bookmarkCount} bookmarks</p>
        </section>

        {#if childFolders.length === 0 && childBookmarks.length === 0}
          <section class="state-panel empty-state" aria-live="polite">
            <span class="state-icon" aria-hidden="true"></span>
            <div>
              <h2>This folder is empty.</h2>
              <p>You can save pages in your browser bookmarks, then find them here.</p>
            </div>
          </section>
        {:else}
          <section class="card-grid" aria-label="Folder contents">
            {#each childFolders as folder (folder.id)}
              <button
                type="button"
                class="content-card folder"
                onclick={() => selectFolder(folder.id)}
              >
                <span class="card-icon" aria-hidden="true"></span>
                <span class="card-body">
                  <span class="card-title">{folder.title}</span>
                  <span class="card-meta">{getDirectChildCount(folder)} items</span>
                  <span class="card-detail">{folder.path.join(' / ')}</span>
                </span>
              </button>
            {/each}

            {#each childBookmarks as bookmark (bookmark.id)}
              <a class="content-card bookmark" href={bookmark.url ?? '#'}>
                <span class="card-icon" aria-hidden="true"></span>
                <span class="card-body">
                  <span class="card-title">{bookmark.title}</span>
                  <span class="card-meta">{bookmark.domain ?? 'Unknown URL'}</span>
                  <span class="card-detail">
                    {bookmark.url ? getDisplayUrl(bookmark.url) : 'Untitled'}
                  </span>
                </span>
              </a>
            {/each}
          </section>
        {/if}
      {/if}
    </main>
  </div>
</div>
