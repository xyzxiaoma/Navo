# Navo

Navo 是一款简洁的浏览器新标签页插件，将你的浏览器原生书签变成清晰的文件夹式可视化工作台。

Navo is a clean visual bookmark workspace for your browser new tab.

## 功能 / Features

- 新标签页书签工作台 / New tab bookmark workspace
- 左侧文件夹树与右侧卡片浏览 / Folder tree with card-based browsing
- 面包屑路径导航 / Breadcrumb navigation
- 全局搜索书签、文件夹、URL、域名和路径 / Global search for bookmarks, folders, URLs, domains, and paths
- 浅色、深色、跟随系统主题 / Light, dark, and system themes
- 本地保存主题、最近文件夹和侧栏折叠偏好 / Local UI preferences for theme, last folder, and sidebar state
- 仅本地读取书签，无账号、无后端、无同步 / Local-first, no account, no backend, no sync

## 技术栈 / Tech Stack

- WXT + Manifest V3
- Svelte 5
- TypeScript
- Vite
- pnpm
- Native CSS + CSS variables

## 开发 / Development

```bash
pnpm install
pnpm dev:chrome
```

常用脚本 / Common scripts:

```bash
pnpm lint
pnpm typecheck
pnpm build:chrome
pnpm build:edge
pnpm zip:chrome
pnpm zip:edge
```

Firefox 脚本已预留给 V1.1 适配 / Firefox scripts are reserved for V1.1 adaptation:

```bash
pnpm dev:firefox
pnpm build:firefox
pnpm zip:firefox
```

## 本地安装 / Local Installation

### Chrome

1. 运行 `pnpm build:chrome`。
2. 打开 `chrome://extensions`。
3. 开启 Developer mode。
4. 点击 Load unpacked。
5. 选择 `.output/chrome-mv3`。
6. 打开新标签页即可看到 Navo。

### Microsoft Edge

1. 运行 `pnpm build:edge`。
2. 打开 `edge://extensions`。
3. 开启 Developer mode。
4. 点击 Load unpacked。
5. 选择 `.output/edge-mv3`。
6. 打开新标签页即可看到 Navo。

### Firefox

Firefox 属于 V1.1 适配目标。仓库保留了 WXT Firefox 脚本，但 V1 主要验收目标是 Chrome 和 Microsoft Edge。

Firefox is planned for V1.1. WXT Firefox scripts are present, but V1 is validated primarily on Chrome and Microsoft Edge.

## 权限与隐私 / Permissions And Privacy

Navo V1 只申请以下权限：

```text
bookmarks
storage
```

`bookmarks` 用于读取浏览器书签树并展示为文件夹工作台。`storage` 用于保存主题、最近选中文件夹和侧栏折叠状态。

Navo 不会上传、同步、出售或保存完整书签副本。它不访问浏览历史，不读取网页内容，不注入网页脚本，也不需要账号登录。

Navo only reads your browser bookmarks locally to render the new tab workspace. It does not upload, sync, sell, or persist a full copy of your bookmarks.

## Roadmap

- V1: Chrome and Edge visual bookmark workspace
- V1.1: Firefox adaptation and release preparation
- V2: Bookmark editing, folder actions, and workspace workflows
- V3: Optional AI-powered organization and richer workspace features

## License

MIT
