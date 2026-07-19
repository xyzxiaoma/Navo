# Navo

Navo 是一款简洁的浏览器新标签页插件，将你的浏览器原生书签变成清晰的文件夹式可视化工作台。

Navo is a clean visual bookmark workspace for your browser new tab.

## 功能 / Features

- 新标签页书签工作台 / New tab bookmark workspace
- 左侧文件夹树与右侧卡片浏览 / Folder tree with card-based browsing
- 面包屑路径导航 / Breadcrumb navigation
- 全局搜索书签、文件夹、URL、域名和路径 / Global search for bookmarks, folders, URLs, domains, and paths
- 首页搜索优先匹配浏览器书签，并提供 Google 搜索词建议 / Homepage search prioritizes bookmarks and offers Google query suggestions
- 浅色、深色、跟随系统主题 / Light, dark, and system themes
- 本地保存主题、最近文件夹和侧栏折叠偏好 / Local UI preferences for theme, last folder, and sidebar state
- 书签数据仅在本地处理，无账号、无后端、无同步 / Bookmark data stays local, with no account, backend, or sync

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

Navo 申请以下权限：

```text
bookmarks
storage
favicon
https://suggestqueries.google.com/*
```

`bookmarks` 用于读取浏览器书签树并展示为文件夹工作台。`storage` 用于保存主题、最近选中文件夹、侧栏状态和书签使用记录。`favicon` 用于显示书签站点图标。Google 建议域名权限仅用于在首页输入搜索词并短暂停顿后获取联想。

书签标题、网址、目录和完整书签树始终在本地匹配，不会发送给 Google。只有符合搜索条件的输入文字会发送到 `suggestqueries.google.com`；完整网址、域名、localhost、IP 地址和过长文本不会用于请求联想。Navo 不持久化搜索词或联想结果，接口不可用时仍可打开本地书签或直接搜索。

Navo 没有账号和后端，不访问浏览历史，不读取网页内容，也不注入网页脚本。

Navo processes bookmark data locally. Only eligible search text is sent directly to `suggestqueries.google.com` for autocomplete; URLs, host-like input, localhost, IP addresses, and excessively long input are excluded. Queries and suggestions are not persisted by Navo, and bookmark search continues to work when the service is unavailable.

## Roadmap

- V1: Chrome and Edge visual bookmark workspace
- V1.1: Firefox adaptation and release preparation
- V2: Bookmark editing, folder actions, and workspace workflows
- V3: Optional AI-powered organization and richer workspace features

## License

MIT
