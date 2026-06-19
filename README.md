# Navo

Navo 是一款简洁的浏览器新标签页插件，将你的浏览器书签变成清晰的文件夹式可视化工作台。

Navo is a clean visual bookmark workspace for your browser new tab.

## Features

- Visual bookmark folders
- New tab homepage
- Bookmark search
- Breadcrumb navigation
- Light, dark, and system themes
- Local-first and privacy-friendly

## Tech Stack

- WXT
- Svelte 5
- TypeScript
- Vite
- Native CSS and CSS variables

## Development

```bash
pnpm install
pnpm dev:chrome
```

## Build

```bash
pnpm build:chrome
pnpm zip:chrome
```

## Install Locally

1. Open the Chrome or Edge extensions page.
2. Enable Developer mode.
3. Load the generated unpacked extension directory from `.output/`.
4. Open a new tab to see Navo.

## Privacy

Navo 只读取你的浏览器书签，用于在新标签页中展示文件夹式书签工作台。Navo 不会上传、同步或出售你的书签数据。

Navo only reads your browser bookmarks to display a visual bookmark workspace on the new tab page. Navo does not upload, sync, or sell your bookmark data.

## Roadmap

- V1: Chrome and Edge new tab bookmark workspace
- V1.1: Firefox adaptation
- V2: Bookmark editing and workspace workflows
- V3: Optional AI-powered organization

## License

MIT
