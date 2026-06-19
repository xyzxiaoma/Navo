<script lang="ts">
  type ThemeMode = 'light' | 'dark' | 'system';

  interface ThemeOption {
    value: ThemeMode;
    label: string;
  }

  interface FolderPreview {
    id: string;
    title: string;
    depth: number;
    count: number;
    active?: boolean;
  }

  interface ContentCard {
    id: string;
    type: 'folder' | 'bookmark';
    title: string;
    meta: string;
    detail: string;
  }

  const themeOptions: ThemeOption[] = [
    { value: 'system', label: 'System' },
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
  ];

  const folderPreview: FolderPreview[] = [
    { id: 'bar', title: 'Bookmarks Bar', depth: 0, count: 24, active: true },
    { id: 'dev', title: 'Development', depth: 1, count: 12 },
    { id: 'ai', title: 'AI Tools', depth: 1, count: 8 },
    { id: 'learn', title: 'Learning', depth: 1, count: 14 },
    { id: 'other', title: 'Other Bookmarks', depth: 0, count: 31 },
  ];

  const contentCards: ContentCard[] = [
    {
      id: 'folder-dev',
      type: 'folder',
      title: 'Development',
      meta: '12 items',
      detail: 'Tools, docs, and repositories',
    },
    {
      id: 'folder-learn',
      type: 'folder',
      title: 'Learning',
      meta: '14 items',
      detail: 'Courses, notes, and references',
    },
    {
      id: 'github',
      type: 'bookmark',
      title: 'GitHub',
      meta: 'github.com',
      detail: 'https://github.com',
    },
    {
      id: 'wxt',
      type: 'bookmark',
      title: 'WXT Documentation',
      meta: 'wxt.dev',
      detail: 'https://wxt.dev',
    },
  ];

  let theme: ThemeMode = 'system';
  let searchDraft = '';

  function setTheme(nextTheme: ThemeMode) {
    theme = nextTheme;
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

  <div class="workspace" aria-label="Bookmark workspace preview">
    <aside class="sidebar" aria-label="Bookmark folders">
      <div class="sidebar-heading">
        <span>Folders</span>
        <small>{folderPreview.length} roots</small>
      </div>

      <nav class="folder-tree" aria-label="Folder tree preview">
        {#each folderPreview as folder (folder.id)}
          <button
            type="button"
            class:active={folder.active}
            class="folder-row"
            style={`--depth: ${folder.depth}`}
          >
            <span class="folder-toggle" aria-hidden="true"></span>
            <span class="folder-icon" aria-hidden="true"></span>
            <span class="folder-title">{folder.title}</span>
            <span class="folder-count">{folder.count}</span>
          </button>
        {/each}
      </nav>
    </aside>

    <main class="content" aria-labelledby="folder-title">
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <button type="button">Bookmarks Bar</button>
        <span aria-hidden="true">/</span>
        <button type="button">Development</button>
      </nav>

      <section class="content-heading">
        <div>
          <p class="section-label">Current folder</p>
          <h1 id="folder-title">Development</h1>
        </div>
        <p class="content-meta">2 folders / 2 bookmarks</p>
      </section>

      <section class="card-grid" aria-label="Folder contents preview">
        {#each contentCards as card (card.id)}
          <article class={`content-card ${card.type}`}>
            <span class="card-icon" aria-hidden="true"></span>
            <div class="card-body">
              <h2>{card.title}</h2>
              <p>{card.meta}</p>
              <small>{card.detail}</small>
            </div>
          </article>
        {/each}
      </section>

      <section class="state-panel empty-state" aria-labelledby="empty-state-title">
        <span class="state-icon" aria-hidden="true"></span>
        <div>
          <h2 id="empty-state-title">This folder is empty.</h2>
          <p>You can save pages in your browser bookmarks, then find them here.</p>
        </div>
      </section>

      <div class="state-templates" hidden>
        <section class="state-panel loading-state">
          <span class="state-icon" aria-hidden="true"></span>
          <p>Loading your bookmarks...</p>
        </section>
        <section class="state-panel error-state">
          <span class="state-icon" aria-hidden="true"></span>
          <p>Failed to load bookmarks. Please check extension permissions.</p>
        </section>
      </div>
    </main>
  </div>
</div>

