<script lang="ts">
  import { onMount } from 'svelte';
  import { getBookmarkTree } from '../../services/bookmark.service';
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
  import { getDisplayUrl } from '../../utils/url';

  type LoadStatus = 'loading' | 'ready' | 'empty' | 'error';

  interface ThemeOption {
    value: ThemeMode;
    label: string;
  }

  const themeOptions: ThemeOption[] = [
    { value: 'system', label: 'System' },
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
  ];

  let theme: ThemeMode = defaultSettings.theme;
  let searchDraft = '';
  let status: LoadStatus = 'loading';
  let errorMessage = '';
  let settings: NavoLocalSettings = { ...defaultSettings };
  let bookmarkTree: NavoBookmarkNode[] = [];
  let selectedFolderId: string | undefined;

  let rootFolders: NavoBookmarkNode[] = [];
  let selectedFolder: NavoBookmarkNode | undefined;
  let childFolders: NavoBookmarkNode[] = [];
  let childBookmarks: NavoBookmarkNode[] = [];
  let pathNodes: NavoBookmarkNode[] = [];
  let folderCount = 0;
  let bookmarkCount = 0;

  $: rootFolders = getEffectiveRootFolders(bookmarkTree);
  $: selectedFolder = selectedFolderId
    ? findFolderById(bookmarkTree, selectedFolderId)
    : undefined;
  $: ({ folders: childFolders, bookmarks: childBookmarks } =
    getFolderChildren(selectedFolder));
  $: ({ folderCount, bookmarkCount } = getChildTypeCounts(selectedFolder));
  $: pathNodes = selectedFolderId
    ? getPathNodes(bookmarkTree, selectedFolderId).filter((node) => node.title)
    : [];

  onMount(() => {
    void loadWorkspace();
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
      bookmarkTree = loadedTree;
      selectedFolderId = fallbackFolder?.id;
      status = fallbackFolder ? 'ready' : 'empty';
    } catch (error) {
      status = 'error';
      errorMessage =
        error instanceof Error ? error.message : 'Failed to load bookmarks.';
    }
  }

  function setTheme(nextTheme: ThemeMode) {
    theme = nextTheme;
    void persistSettings({ ...settings, theme: nextTheme });
  }

  function selectFolder(folderId: string) {
    const folder = findFolderById(bookmarkTree, folderId);
    if (!folder) return;

    selectedFolderId = folder.id;
    void persistSettings({ ...settings, lastSelectedFolderId: folder.id });
  }

  async function persistSettings(nextSettings: NavoLocalSettings) {
    settings = nextSettings;

    try {
      await saveSettings(nextSettings);
    } catch {
      // Settings persistence should not block bookmark browsing.
    }
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

    <label class="search-box" for="bookmark-search">
      <span class="search-icon" aria-hidden="true"></span>
      <input
        id="bookmark-search"
        bind:value={searchDraft}
        type="search"
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

  <div class="workspace" aria-label="Bookmark workspace">
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
      {:else if rootFolders.length > 0}
        <nav class="folder-tree" aria-label="Folder tree">
          {#each rootFolders as folder (folder.id)}
            <button
              type="button"
              class:active={selectedFolderId === folder.id}
              class="folder-row"
              style="--depth: 0"
              aria-current={selectedFolderId === folder.id ? 'page' : false}
              onclick={() => selectFolder(folder.id)}
            >
              <span class="folder-toggle" aria-hidden="true"></span>
              <span class="folder-icon" aria-hidden="true"></span>
              <span class="folder-title">{folder.title}</span>
              <span class="folder-count">{getDirectChildCount(folder)}</span>
            </button>
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
