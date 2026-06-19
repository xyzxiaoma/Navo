# Navo 浏览器新标签页插件 V1 SPEC

> Version: v1.0  
> Project: Navo  
> Repository: `git@github.com:xyzxiaoma/Navo.git`  
> Owner: `xyzxiaoma`  
> Default branch: `main`  
> Document type: Product + Technical SPEC  
> Scope: V1 only — visual bookmark folder homepage

---

## 0. 文档说明

本文档用于指导 Navo V1 的产品设计、技术实现、目录结构、跨浏览器适配、GitHub 开源仓库规范以及后续 AI Agent 自动开发与提交。

V1 版本只聚焦一个核心能力：

> 将浏览器原生书签以“文件夹资源管理器”的形式展示在新标签页中，让用户可以像浏览文件夹一样浏览、搜索和打开自己的书签。

V1 不做 AI、不做账号、不做同步、不做书签编辑、不做书签删除，避免功能过大导致第一版无法快速落地。

---

## 1. 项目基本信息

### 1.1 项目名称

```text
Navo
```

### 1.2 GitHub 仓库

```bash
git@github.com:xyzxiaoma/Navo.git
```

备用 HTTPS 地址：

```bash
https://github.com/xyzxiaoma/Navo.git
```

### 1.3 仓库信息

| 项目 | 内容 |
|---|---|
| GitHub 用户名 | `xyzxiaoma` |
| 仓库名 | `Navo` |
| 默认分支 | `main` |
| 可见性 | Public |
| 开源协议 | MIT |
| README 语言 | 中英双语，优先中文 |
| 项目类型 | Browser Extension / New Tab Extension |
| V1 主要平台 | Chrome、Microsoft Edge |
| V1.1 适配平台 | Firefox |
| 后续预留 | Safari、其他 Chromium 浏览器 |

### 1.4 一句话介绍

中文：

> Navo 是一款简洁的浏览器新标签页插件，将你的浏览器书签变成清晰的文件夹式可视化工作台。

英文：

> Navo is a clean visual bookmark workspace for your browser new tab.

---

## 2. 产品定位

Navo 不是传统的网址导航站，也不是复杂的生产力平台。  
V1 的定位是：

> 一个轻量、清爽、可扩展的新标签页书签可视化首页。

它要解决的问题是：

1. 浏览器收藏夹层级很深，不直观。
2. 用户收藏很多网页后，再次查找困难。
3. 默认收藏夹 UI 体验较弱。
4. 常用网页、学习资料、开发工具缺少一个舒服的入口。
5. 用户希望在新标签页中直接管理自己的浏览入口。

---

## 3. V1 核心目标

### 3.1 用户目标

用户安装插件后，每次打开浏览器新标签页，可以：

1. 看到自己的浏览器原生书签结构。
2. 像浏览文件夹一样进入不同书签目录。
3. 通过左侧树形目录快速切换文件夹。
4. 通过右侧卡片查看当前文件夹下的子文件夹和网页书签。
5. 点击网页书签直接打开。
6. 通过搜索快速找到某个书签或文件夹。
7. 通过面包屑路径返回上级目录。
8. 使用浅色 / 深色模式获得更好的视觉体验。

### 3.2 产品目标

V1 要做到：

1. 功能范围极简。
2. 首屏加载快。
3. 动画流畅。
4. UI 高级、克制、清爽。
5. 不破坏用户原有书签。
6. 不需要登录。
7. 不依赖后端。
8. 不上传任何用户书签数据。
9. 不请求多余浏览器权限。
10. 后续可以自然扩展成更完整的浏览器工作台。

---

## 4. V1 功能范围

### 4.1 V1 包含功能

| 模块 | 功能 | V1 是否包含 |
|---|---|---|
| 新标签页替换 | 打开新标签页显示 Navo 首页 | 是 |
| 书签读取 | 读取浏览器原生书签树 | 是 |
| 文件夹树 | 左侧显示书签文件夹结构 | 是 |
| 文件夹浏览 | 点击文件夹查看内部内容 | 是 |
| 书签卡片 | 右侧以卡片形式展示网页书签 | 是 |
| 文件夹卡片 | 右侧以卡片形式展示子文件夹 | 是 |
| 面包屑导航 | 显示当前所在路径并支持返回 | 是 |
| 搜索 | 根据标题、URL、文件夹名搜索 | 是 |
| 主题切换 | 支持浅色 / 深色 / 跟随系统 | 是 |
| 空状态 | 文件夹为空时显示提示 | 是 |
| 加载状态 | 读取书签时显示 loading | 是 |
| 异常状态 | 无权限或读取失败时显示错误提示 | 是 |
| 设置保存 | 保存主题、最后选中文件夹等偏好 | 是 |

### 4.2 V1 明确不做功能

V1 不做以下功能：

1. 不做 AI 自动分类。
2. 不做 AI 网页摘要。
3. 不做书签新增。
4. 不做书签删除。
5. 不做书签编辑。
6. 不做拖拽排序。
7. 不做云同步。
8. 不做账号登录。
9. 不做历史记录管理。
10. 不做标签页管理。
11. 不做稍后阅读。
12. 不做工作空间一键打开。
13. 不做移动端极致适配。
14. 不做浏览器商店自动发布。
15. 不做复杂权限申请。

说明：

> V1 只读取和展示书签，不修改用户浏览器书签，避免误操作风险。

---

## 5. 目标用户

### 5.1 核心用户

1. 收藏夹很多但整理困难的用户。
2. 学生。
3. 程序员。
4. 内容创作者。
5. 经常收藏资料、后台、工具、文档的人。
6. 希望新标签页更清爽的人。

### 5.2 典型场景

#### 场景一：快速打开常用网站

用户打开新标签页，点击左侧“开发工具”，右侧展示 GitHub、Gitee、Vercel 等书签，点击 GitHub 即可打开。

#### 场景二：查找很久以前收藏的网站

用户在搜索框输入 `spring`，页面展示所有标题、URL 或路径中包含 spring 的书签和文件夹。

#### 场景三：浏览自己的收藏结构

用户左侧看到完整文件夹树，右侧看到当前文件夹内容，可以像使用文件资源管理器一样层层进入。

---

## 6. 页面整体设计

### 6.1 页面布局

V1 采用三段式布局：

```text
┌──────────────────────────────────────────────┐
│ 顶部栏：Logo + 搜索框 + 主题切换              │
├───────────────┬──────────────────────────────┤
│ 左侧文件夹树   │ 右侧内容区域                  │
│               │                              │
│ 书签栏         │ 当前路径：书签栏 > 开发工具    │
│ ├ 开发工具     │                              │
│ ├ AI 工具      │ 文件夹卡片                    │
│ ├ 学习资料     │ 书签卡片                      │
│ └ 其他         │                              │
└───────────────┴──────────────────────────────┘
```

### 6.2 页面区域

1. Header 顶部栏。
2. Sidebar 左侧文件夹树。
3. Main 右侧内容区。
4. Breadcrumb 面包屑。
5. Search Results 搜索结果区。
6. Empty / Loading / Error 状态区。

---

## 7. 模块详细需求

## 7.1 Header 顶部栏

### 7.1.1 显示内容

顶部栏包含：

1. 产品 Logo。
2. 产品名：Navo。
3. 搜索框。
4. 主题切换按钮。
5. 可选：设置按钮，V1 可暂不实现复杂设置页。

### 7.1.2 搜索框占位文案

英文：

```text
Search bookmarks, folders, or URLs...
```

中文：

```text
搜索书签、文件夹或网址...
```

### 7.1.3 搜索行为

当用户输入关键词时：

1. 隐藏当前文件夹内容视图。
2. 显示搜索结果视图。
3. 搜索范围为全部书签树。
4. 搜索匹配字段包括：
   - 书签标题。
   - 书签 URL。
   - 域名。
   - 文件夹名称。
   - 所在路径。

当搜索框清空时：

1. 恢复当前文件夹内容视图。
2. 保持用户之前所在文件夹不变。

---

## 7.2 Sidebar 左侧文件夹树

### 7.2.1 功能

左侧用于展示浏览器书签中的所有文件夹。

### 7.2.2 展示规则

1. 只展示文件夹节点。
2. 不展示普通网页书签。
3. 支持多级缩进。
4. 当前选中的文件夹需要高亮。
5. 文件夹前显示文件夹图标。
6. 如果文件夹有子文件夹，可以显示展开 / 收起箭头。

### 7.2.3 默认展开规则

首次进入页面时：

1. 默认选中“书签栏”或第一个有效根文件夹。
2. 默认展开一级根目录。
3. 子文件夹默认收起。

### 7.2.4 点击行为

用户点击某个文件夹后：

1. 左侧该文件夹高亮。
2. 右侧显示该文件夹下的内容。
3. 顶部面包屑更新为该文件夹路径。
4. 将该文件夹 ID 保存为 `lastSelectedFolderId`。

---

## 7.3 Main 右侧内容区

### 7.3.1 显示内容

右侧内容区展示当前文件夹下的直接子内容：

1. 子文件夹。
2. 网页书签。

### 7.3.2 排序规则

V1 不改变浏览器书签的原始顺序。

展示建议：

1. 文件夹排在前面。
2. 网页书签排在后面。
3. 同类型内部保持浏览器原始顺序。

### 7.3.3 文件夹卡片

文件夹卡片展示：

1. 文件夹图标。
2. 文件夹名称。
3. 内部包含数量。
4. 可选：子文件夹数量和书签数量。

示例：

```text
┌──────────────────────┐
│ 📁 后端开发           │
│ 12 items             │
└──────────────────────┘
```

点击文件夹卡片后，进入该文件夹。

### 7.3.4 书签卡片

书签卡片展示：

1. 网站图标或默认图标。
2. 书签标题。
3. 域名。
4. URL 简略信息。

示例：

```text
┌──────────────────────┐
│ 🌐 GitHub             │
│ github.com           │
└──────────────────────┘
```

点击书签卡片后，在当前标签页打开该网页。

---

## 7.4 Breadcrumb 面包屑导航

### 7.4.1 功能

面包屑用于展示当前所在路径，避免用户在多级文件夹中迷路。

示例：

```text
书签栏 > 开发工具 > 后端 > Spring Boot
```

### 7.4.2 点击行为

用户点击任意一级路径：

1. 跳转到对应文件夹。
2. 左侧文件夹树同步高亮。
3. 右侧内容区同步刷新。

---

## 7.5 Search Results 搜索结果页

### 7.5.1 触发条件

当搜索框内容不为空时，进入搜索结果模式。

### 7.5.2 搜索范围

搜索范围为全部书签树，包括：

1. 所有文件夹名称。
2. 所有书签标题。
3. 所有书签 URL。
4. 域名。
5. 路径文本。

### 7.5.3 搜索结果分组

搜索结果分为两类：

```text
Folders
Bookmarks
```

### 7.5.4 搜索结果项

文件夹搜索结果展示：

1. 文件夹图标。
2. 文件夹名称。
3. 所在路径。

网页书签搜索结果展示：

1. 网站图标。
2. 书签标题。
3. 域名。
4. 所在路径。

### 7.5.5 点击行为

点击文件夹结果：

1. 进入该文件夹。
2. 清空搜索框。
3. 更新左侧选中状态。
4. 更新面包屑。

点击网页书签结果：

1. 在当前标签页打开该网页。

### 7.5.6 无结果状态

英文：

```text
No results found.
Try another keyword.
```

中文：

```text
没有找到相关书签
换个关键词试试
```

---

## 8. 状态设计

### 8.1 加载状态

读取书签树时显示 Loading。

英文：

```text
Loading your bookmarks...
```

中文：

```text
正在加载你的书签...
```

### 8.2 空文件夹状态

当前文件夹没有任何子文件夹或书签时显示：

```text
This folder is empty.
```

中文：

```text
这个文件夹还是空的。
你可以在浏览器收藏一些网页后，再回到这里查看。
```

### 8.3 错误状态

如果读取书签失败，显示：

```text
Failed to load bookmarks.
Please check extension permissions.
```

中文：

```text
书签加载失败。
请检查插件权限是否正常。
```

### 8.4 无权限状态

如果浏览器拒绝或未授予书签权限：

```text
Navo needs bookmark permission to show your bookmark workspace.
```

中文：

```text
Navo 需要书签权限，才能展示你的书签工作台。
```

---

## 9. 交互细节

### 9.1 打开网页书签

用户点击书签卡片后：

1. 默认在当前标签页打开。
2. 不额外请求 `tabs` 权限。
3. 使用普通链接跳转方式实现。

建议实现：

```ts
window.location.href = bookmark.url
```

### 9.2 卡片 hover 效果

鼠标悬浮卡片时：

1. 卡片轻微上浮。
2. 边框颜色变明显。
3. 鼠标变为 pointer。
4. 标题颜色略微强调。
5. 动画使用 `transform` 和 `opacity`，避免频繁触发布局计算。

### 9.3 左侧文件夹 hover 效果

鼠标悬浮文件夹时：

1. 背景轻微高亮。
2. 文件夹图标保持清晰。
3. 当前选中项使用更明显背景区分。

### 9.4 搜索输入体验

1. 输入时实时搜索。
2. 搜索不区分大小写。
3. 前后空格自动 trim。
4. 空字符串不触发搜索。
5. 搜索建议使用防抖，推荐 150ms。
6. 清空搜索后恢复之前浏览位置。

---

## 10. 视觉风格

### 10.1 整体风格关键词

1. 清爽。
2. 高级。
3. 克制。
4. 类文件管理器。
5. 类工作台。
6. 不花哨。
7. 不像传统网址导航站。
8. 不像后台管理系统。

### 10.2 浅色模式

推荐：

```text
背景：#F7F8FA
面板：#FFFFFF
卡片：#FFFFFF
主文字：#1F2937
副文字：#6B7280
边框：#E5E7EB
强调色：#2563EB
```

### 10.3 深色模式

推荐：

```text
背景：#0F1115
侧边栏：#151821
卡片：#1B1F2A
主文字：#F3F4F6
副文字：#9CA3AF
边框：#2A2F3A
强调色：#60A5FA
```

### 10.4 圆角与阴影

推荐：

```text
页面大卡片圆角：20px
普通卡片圆角：16px
按钮圆角：12px
输入框圆角：14px
阴影：轻微，不要过重
```

### 10.5 字体

推荐：

```css
font-family:
Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
"Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
```

---

## 11. 技术栈最终决策

### 11.1 最终技术栈

```text
Extension Framework: WXT
UI Framework: Svelte 5
Language: TypeScript
Build Tool: Vite
Extension Standard: Manifest V3 first
Package Manager: pnpm
Style System: Native CSS + CSS Variables
Animation: CSS Transition + Svelte transition
Future Animation Library: Motion
Local Storage: browser.storage / chrome.storage
Bookmark API: browser.bookmarks / chrome.bookmarks
```

### 11.2 选型理由

Navo 的需求是：

1. 轻量。
2. 动画流畅。
3. 后期可扩展更多动画。
4. 后续支持多浏览器。
5. 代码结构要适合开源。
6. 适合 AI Agent 自动开发和维护。

因此选择：

> WXT + Svelte 5 + TypeScript

### 11.3 为什么选择 WXT

Navo 后续计划支持：

1. Chrome。
2. Microsoft Edge。
3. Firefox。
4. 其他 Chromium 系浏览器。
5. 未来可预留 Safari。

WXT 可以基于同一套代码构建不同浏览器目标，减少多浏览器适配成本。

项目不直接手写多份 manifest，而是通过 WXT 管理扩展入口、manifest 配置、构建输出和浏览器差异。

### 11.4 为什么选择 Svelte 5

Svelte 适合 Navo 的原因：

1. 编译型框架，运行时负担较轻。
2. 组件代码简洁。
3. 状态管理成本低。
4. 内置 transition 能力适合做页面过渡。
5. 适合开发小而精的浏览器插件。
6. 后续可以自然扩展更多微交互和动画。

### 11.5 为什么不用 Vue / React

Vue 和 React 都能做，但 Navo V1 不是后台管理系统，而是每天会被频繁打开的新标签页工具。

Navo 更需要：

1. 启动快。
2. 包体积小。
3. 动画自然。
4. 代码简单。
5. 视觉风格可控。

因此 V1 选择 Svelte 更合适。

### 11.6 为什么不使用重型 UI 框架

V1 不使用：

1. Element Plus。
2. Naive UI。
3. Ant Design。
4. Material UI。

原因：

1. Navo 不是后台管理系统。
2. 插件页面需要轻量。
3. UI 需要有自己的产品风格。
4. 组件库默认样式容易让页面变得普通。
5. 自定义 CSS 更适合做高级动画和主题系统。

---

## 12. 跨浏览器适配方案

### 12.1 浏览器支持优先级

V1 优先支持：

```text
Chrome
Microsoft Edge
```

V1.1 适配：

```text
Firefox
```

后续预留：

```text
Safari
其他 Chromium 浏览器
```

### 12.2 API 使用原则

项目中不直接把业务逻辑强绑定在 `chrome.*` 命名空间上。

建议封装统一浏览器 API 层：

```ts
// src/services/browser-api.ts

export const browserApi = {
  bookmarks: browser.bookmarks,
  storage: browser.storage
}
```

如果目标环境需要兼容 `chrome.*`，则在该层内部处理差异，业务组件不直接关心浏览器差异。

### 12.3 权限最小化原则

V1 只申请：

```text
bookmarks
storage
```

V1 不申请：

```text
tabs
history
cookies
webRequest
activeTab
scripting
host_permissions
```

### 12.4 Manifest 策略

Navo 使用 Manifest V3 优先策略。

基础配置：

```json
{
  "permissions": ["bookmarks", "storage"],
  "chrome_url_overrides": {
    "newtab": "newtab.html"
  }
}
```

Firefox 发布时需要根据 Firefox WebExtensions 要求补充浏览器特定配置，例如：

```json
{
  "browser_specific_settings": {
    "gecko": {
      "id": "navo@xyzxiaoma.github.io",
      "strict_min_version": "109.0"
    }
  }
}
```

具体构建差异由 WXT 管理。

---

## 13. 数据结构设计

### 13.1 浏览器原始书签节点

```ts
interface BrowserBookmarkNode {
  id: string
  parentId?: string
  index?: number
  title: string
  url?: string
  dateAdded?: number
  dateGroupModified?: number
  children?: BrowserBookmarkNode[]
}
```

判断规则：

```ts
const isFolder = Array.isArray(node.children)
const isBookmark = !!node.url
```

### 13.2 前端内部书签节点

```ts
type NavoNodeType = 'folder' | 'bookmark'

interface NavoBookmarkNode {
  id: string
  type: NavoNodeType
  title: string
  url?: string
  domain?: string
  parentId?: string
  children?: NavoBookmarkNode[]
  path: string[]
  raw: unknown
}
```

说明：

1. `type` 用于区分文件夹和网页书签。
2. `domain` 用于书签卡片展示域名。
3. `path` 用于搜索结果展示所在路径。
4. `raw` 保留原始节点，便于后续扩展。

---

## 14. 本地存储设计

V1 只保存少量界面偏好，不保存用户完整书签副本。

### 14.1 设置结构

```ts
interface NavoLocalSettings {
  theme: 'light' | 'dark' | 'system'
  lastSelectedFolderId?: string
  sidebarCollapsed?: boolean
}
```

### 14.2 默认设置

```ts
const defaultSettings: NavoLocalSettings = {
  theme: 'system',
  sidebarCollapsed: false
}
```

### 14.3 存储位置

使用：

```text
browser.storage.local
```

或由封装层兼容：

```text
chrome.storage.local
```

---

## 15. 搜索索引设计

读取书签树后，生成扁平化搜索索引。

```ts
interface SearchIndexItem {
  id: string
  type: 'folder' | 'bookmark'
  title: string
  url?: string
  domain?: string
  pathText: string
  node: NavoBookmarkNode
}
```

搜索匹配字段：

```text
title
url
domain
pathText
```

搜索规则：

1. 忽略大小写。
2. trim 前后空格。
3. 空关键词不搜索。
4. 搜索结果按照文件夹、网页书签分组。
5. V1 不做拼音搜索。
6. V1 不做模糊匹配算法，只做包含匹配。

---

## 16. 动画方案

### 16.1 V1 动画原则

V1 动画只使用：

1. CSS transition。
2. Svelte 内置 transition。
3. transform。
4. opacity。
5. 少量 filter。

不使用复杂动画库，避免增加包体积。

### 16.2 动画场景

V1 需要实现的动画：

1. 卡片 hover 上浮。
2. 侧边栏文件夹展开 / 收起。
3. 搜索结果出现 / 消失。
4. 页面内容切换淡入。
5. 主题切换过渡。
6. Loading 状态过渡。

### 16.3 性能原则

1. 优先使用 `transform` 和 `opacity`。
2. 避免频繁动画 `width`、`height`、`top`、`left`。
3. 大量卡片渲染时避免复杂阴影和滤镜。
4. 搜索输入使用 150ms 防抖。
5. 书签树只在页面初始化时读取一次。

### 16.4 后续复杂动画预留

后续如果需要：

1. 文件夹展开动效。
2. 卡片重排动画。
3. 搜索结果平滑切换。
4. 拖拽排序。
5. 工作空间切换动画。
6. 类桌面系统的窗口动画。

可以引入：

```text
Motion
```

---

## 17. 项目目录结构

推荐目录：

```text
Navo/
├─ .github/
│  ├─ workflows/
│  │  ├─ ci.yml
│  │  └─ release.yml
│  └─ ISSUE_TEMPLATE/
├─ public/
│  └─ icons/
│     ├─ icon-16.png
│     ├─ icon-48.png
│     └─ icon-128.png
├─ entrypoints/
│  └─ newtab/
│     ├─ index.html
│     ├─ main.ts
│     └─ App.svelte
├─ src/
│  ├─ components/
│  │  ├─ AppHeader.svelte
│  │  ├─ SearchBox.svelte
│  │  ├─ SidebarTree.svelte
│  │  ├─ SidebarTreeItem.svelte
│  │  ├─ Breadcrumb.svelte
│  │  ├─ FolderCard.svelte
│  │  ├─ BookmarkCard.svelte
│  │  ├─ SearchResults.svelte
│  │  ├─ EmptyState.svelte
│  │  └─ LoadingState.svelte
│  ├─ services/
│  │  ├─ browser-api.ts
│  │  ├─ bookmark.service.ts
│  │  └─ storage.service.ts
│  ├─ stores/
│  │  ├─ bookmark.store.ts
│  │  ├─ theme.store.ts
│  │  └─ ui.store.ts
│  ├─ types/
│  │  ├─ bookmark.ts
│  │  └─ settings.ts
│  ├─ utils/
│  │  ├─ tree.ts
│  │  ├─ search.ts
│  │  ├─ url.ts
│  │  └─ animation.ts
│  └─ styles/
│     ├─ reset.css
│     ├─ tokens.css
│     ├─ global.css
│     └─ animations.css
├─ wxt.config.ts
├─ package.json
├─ tsconfig.json
├─ README.md
├─ LICENSE
├─ CHANGELOG.md
├─ CONTRIBUTING.md
├─ .gitignore
└─ .editorconfig
```

---

## 18. 核心组件设计

### 18.1 App.svelte

职责：

1. 加载书签树。
2. 管理当前选中文件夹。
3. 管理搜索关键词。
4. 管理主题。
5. 组合页面整体布局。
6. 处理 loading、empty、error 状态。

### 18.2 AppHeader.svelte

职责：

1. 展示 Logo 和产品名。
2. 展示搜索框。
3. 展示主题切换按钮。

Props：

```ts
interface Props {
  keyword: string
  theme: 'light' | 'dark' | 'system'
}
```

Events：

```text
update:keyword
toggle-theme
```

### 18.3 SidebarTree.svelte

职责：

1. 渲染左侧文件夹树。
2. 支持展开 / 收起。
3. 支持选中文件夹。

Props：

```ts
interface Props {
  nodes: NavoBookmarkNode[]
  selectedFolderId: string
}
```

Events：

```text
select-folder
```

### 18.4 SidebarTreeItem.svelte

职责：

1. 渲染单个文件夹节点。
2. 根据层级显示缩进。
3. 控制子节点展开 / 收起。

### 18.5 Breadcrumb.svelte

职责：

1. 展示当前文件夹路径。
2. 支持点击路径返回上级。

Props：

```ts
interface Props {
  pathNodes: NavoBookmarkNode[]
}
```

Events：

```text
select-folder
```

### 18.6 FolderCard.svelte

职责：

1. 展示文件夹名称。
2. 展示内部数量。
3. 点击进入文件夹。

Props：

```ts
interface Props {
  folder: NavoBookmarkNode
}
```

Events：

```text
open-folder
```

### 18.7 BookmarkCard.svelte

职责：

1. 展示网页书签。
2. 展示标题。
3. 展示域名。
4. 点击打开网页。

Props：

```ts
interface Props {
  bookmark: NavoBookmarkNode
}
```

点击行为：

```ts
window.location.href = bookmark.url
```

### 18.8 SearchResults.svelte

职责：

1. 展示搜索结果。
2. 分组展示文件夹和网页书签。
3. 处理无结果状态。
4. 支持点击结果跳转或打开。

---

## 19. 核心服务设计

### 19.1 browser-api.ts

统一封装浏览器 API，避免业务代码直接依赖 `chrome.*` 或 `browser.*`。

```ts
export const browserApi = {
  bookmarks: browser.bookmarks,
  storage: browser.storage
}
```

如果运行环境只有 `chrome`，在该文件中兼容处理。

### 19.2 bookmark.service.ts

负责：

1. 调用浏览器书签 API。
2. 获取完整书签树。
3. 转换为内部数据结构。
4. 提供查找当前文件夹、查找路径、生成索引等能力。

示例：

```ts
export async function getBookmarkTree(): Promise<NavoBookmarkNode[]> {
  const tree = await browserApi.bookmarks.getTree()
  return transformBookmarkTree(tree)
}
```

### 19.3 storage.service.ts

负责保存和读取本地设置。

```ts
export async function getSettings(): Promise<NavoLocalSettings> {
  const result = await browserApi.storage.local.get(['settings'])

  return {
    ...defaultSettings,
    ...result.settings
  }
}

export async function saveSettings(settings: NavoLocalSettings): Promise<void> {
  await browserApi.storage.local.set({ settings })
}
```

---

## 20. 核心工具函数

### 20.1 tree.ts

职责：

1. 转换书签树。
2. 查找节点。
3. 查找父路径。
4. 获取文件夹数量。
5. 获取书签数量。

### 20.2 search.ts

职责：

1. 创建搜索索引。
2. 执行关键词搜索。
3. 分组搜索结果。

示例：

```ts
export function searchBookmarks(
  nodes: NavoBookmarkNode[],
  keyword: string
): NavoBookmarkNode[] {
  const query = keyword.trim().toLowerCase()

  if (!query) return []

  const result: NavoBookmarkNode[] = []

  function walk(list: NavoBookmarkNode[]) {
    for (const node of list) {
      const title = node.title.toLowerCase()
      const url = node.url?.toLowerCase() || ''
      const domain = node.domain?.toLowerCase() || ''
      const pathText = node.path.join(' / ').toLowerCase()

      if (
        title.includes(query) ||
        url.includes(query) ||
        domain.includes(query) ||
        pathText.includes(query)
      ) {
        result.push(node)
      }

      if (node.children?.length) {
        walk(node.children)
      }
    }
  }

  walk(nodes)

  return result
}
```

### 20.3 url.ts

职责：

1. 从 URL 中提取域名。
2. 处理 URL 解析失败。
3. 生成 favicon 地址，V1 可选。
4. 简化 URL 显示。

示例：

```ts
export function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}
```

---

## 21. Manifest 配置

### 21.1 基础配置

WXT 中配置 manifest 信息，最终生成目标浏览器所需 manifest。

核心配置：

```ts
export default defineConfig({
  manifest: {
    name: 'Navo',
    description: 'A clean visual bookmark workspace for your browser new tab.',
    version: '1.0.0',
    permissions: ['bookmarks', 'storage'],
    chrome_url_overrides: {
      newtab: 'newtab.html'
    },
    icons: {
      16: '/icons/icon-16.png',
      48: '/icons/icon-48.png',
      128: '/icons/icon-128.png'
    }
  }
})
```

### 21.2 权限说明

V1 仅申请：

```text
bookmarks
storage
```

说明：

1. `bookmarks` 用于读取浏览器书签树。
2. `storage` 用于保存主题和界面偏好。

V1 不申请：

```text
tabs
history
cookies
webRequest
activeTab
scripting
host_permissions
```

---

## 22. package.json 脚本规范

建议脚本：

```json
{
  "scripts": {
    "dev": "wxt",
    "dev:chrome": "wxt -b chrome",
    "dev:edge": "wxt -b edge",
    "dev:firefox": "wxt -b firefox",
    "build": "wxt build",
    "build:chrome": "wxt build -b chrome",
    "build:edge": "wxt build -b edge",
    "build:firefox": "wxt build -b firefox",
    "zip": "wxt zip",
    "zip:chrome": "wxt zip -b chrome",
    "zip:edge": "wxt zip -b edge",
    "zip:firefox": "wxt zip -b firefox",
    "typecheck": "svelte-check --tsconfig ./tsconfig.json",
    "lint": "eslint .",
    "format": "prettier --write ."
  }
}
```

### 22.1 包管理器

使用：

```text
pnpm
```

原因：

1. 速度快。
2. 磁盘占用低。
3. 适合现代前端项目。
4. lockfile 明确，利于开源协作。

---

## 23. GitHub 开源仓库规范

### 23.1 README.md 必须包含

README 至少包含：

1. 项目介绍。
2. 功能截图。
3. 核心功能。
4. 技术栈。
5. 本地开发方式。
6. Chrome 安装方式。
7. Edge 安装方式。
8. Firefox 适配说明。
9. 隐私说明。
10. Roadmap。
11. License。

### 23.2 LICENSE

使用：

```text
MIT License
```

### 23.3 CHANGELOG.md

记录每个版本变化。

示例：

```md
# Changelog

## 1.0.0

- Initial release.
- Add visual bookmark folder homepage.
- Add bookmark search.
- Add light and dark theme.
```

### 23.4 CONTRIBUTING.md

说明贡献方式：

1. Fork 仓库。
2. 创建功能分支。
3. 提交代码。
4. 运行检查。
5. 提交 Pull Request。

### 23.5 .gitignore

必须忽略：

```gitignore
node_modules
.output
.wxt
dist
.env
.env.local
.DS_Store
*.log
```

---

## 24. Git 工作流与 AI 自动提交规范

### 24.1 仓库地址

AI Agent 应使用 SSH 地址：

```bash
git@github.com:xyzxiaoma/Navo.git
```

### 24.2 提交规则

完成一个可运行阶段后提交一次代码。

每次提交前必须执行：

```bash
pnpm typecheck
pnpm build
```

如果当前阶段还没有配置完整检查脚本，至少执行：

```bash
pnpm build
```

### 24.3 自动提交流程

AI Agent 每完成一个阶段，执行：

```bash
git status
git add .
git commit -m "feat: initialize navo extension"
git push origin main
```

### 24.4 提交信息规范

使用 Conventional Commits。

常用类型：

```text
feat: 新功能
fix: 修复问题
docs: 文档
style: 样式调整
refactor: 重构
chore: 工程配置
test: 测试
build: 构建相关
ci: CI 配置
```

示例：

```bash
feat: initialize navo extension
feat: add bookmark tree viewer
feat: add bookmark search
style: polish new tab layout
docs: update project spec
chore: configure github actions
```

### 24.5 安全规则

严禁提交：

1. GitHub Token。
2. SSH 私钥。
3. `.env`。
4. `.env.local`。
5. 浏览器本地用户数据。
6. 个人账号密码。
7. API Key。
8. node_modules。
9. dist / output 构建产物，除非明确用于 Release。

### 24.6 当前本机 SSH 状态

用户本机已经通过 GitHub SSH 测试：

```text
Hi xyzxiaoma! You've successfully authenticated, but GitHub does not provide shell access.
```

说明 Windows 本机已经可以通过 SSH 与 GitHub 通信。

注意：

> 如果 AI Agent 运行在 WSL、服务器、云端沙盒中，需要在对应环境单独配置 SSH Key，不能直接假设 Windows 本机配置可用。

---

## 25. GitHub Actions 预留

V1 可以先只做基础 CI，不做自动发布商店。

### 25.1 CI 检查

`.github/workflows/ci.yml` 后续可包含：

1. 安装 pnpm。
2. 安装依赖。
3. 类型检查。
4. 构建 Chrome。
5. 构建 Edge。
6. 构建 Firefox。

### 25.2 Release 预留

后续 `release.yml` 可实现：

1. 打 tag 时构建 zip。
2. 上传 Chrome zip。
3. 上传 Edge zip。
4. 上传 Firefox zip。
5. 生成 GitHub Release。

V1 不强制实现自动发布到 Chrome Web Store、Edge Add-ons、Firefox Add-ons。

---

## 26. 隐私与安全设计

### 26.1 隐私原则

Navo V1 必须遵守：

1. 不上传用户书签。
2. 不保存用户完整书签副本。
3. 不访问浏览历史。
4. 不读取网页内容。
5. 不注入网页脚本。
6. 不请求用户账号。
7. 所有数据只在用户本地浏览器中使用。
8. 只保存主题、当前文件夹等界面偏好。

### 26.2 权限解释文案

中文：

```text
Navo 只读取你的浏览器书签，用于在新标签页中展示文件夹式书签工作台。Navo 不会上传、同步或出售你的书签数据。
```

英文：

```text
Navo only reads your browser bookmarks to display a visual bookmark workspace on the new tab page. Navo does not upload, sync, or sell your bookmark data.
```

---

## 27. 响应式要求

### 27.1 桌面端

宽度 >= 1024px：

1. 使用左侧栏 + 右侧内容布局。
2. 左侧栏固定宽度，建议 260px。
3. 右侧内容自适应。
4. 卡片使用自适应网格。

### 27.2 中等屏幕

宽度 768px - 1024px：

1. 左侧栏可保持，但宽度可缩小。
2. 卡片减少每行数量。
3. 搜索框保持可用。

### 27.3 小屏幕

宽度 < 768px：

1. 左侧栏可以折叠。
2. 顶部显示菜单按钮。
3. 右侧内容单列展示。

说明：

> V1 主要面向桌面浏览器，不重点优化移动端。

---

## 28. 性能要求

1. 读取书签后应在 1 秒内完成首屏展示。
2. 搜索 1000 条书签时应无明显卡顿。
3. 搜索输入使用 150ms 防抖。
4. 书签树只在页面加载时读取一次。
5. 搜索使用前端内存中的扁平化索引。
6. 不要每次搜索都重新调用浏览器书签 API。
7. 主要动画使用 transform 和 opacity。
8. 避免在大量卡片上使用过重阴影和滤镜。
9. 不引入重型 UI 框架。
10. 不引入未使用的大型工具库。

---

## 29. 异常情况处理

### 29.1 书签为空

显示空状态，不报错。

### 29.2 某些书签没有标题

如果标题为空：

1. 优先显示域名。
2. 如果域名也没有，显示 `Untitled`。

### 29.3 URL 无法解析

如果 URL 解析失败：

1. 仍然展示标题。
2. 域名位置显示原 URL。
3. 点击仍尝试打开原 URL。

### 29.4 书签树只有根节点

如果没有有效文件夹：

1. 显示空状态。
2. 提示用户可以先收藏一些网页。

### 29.5 权限失败

显示权限提示，不崩溃。

---

## 30. 验收标准

### 30.1 功能验收

插件安装后：

1. 打开新标签页显示 Navo 页面。
2. 页面可以成功读取浏览器书签。
3. 左侧可以看到书签文件夹结构。
4. 点击左侧文件夹，右侧内容正确变化。
5. 点击右侧文件夹卡片，可以进入该文件夹。
6. 点击右侧书签卡片，可以打开对应网页。
7. 面包屑可以正确显示当前路径。
8. 点击面包屑任意一级，可以返回对应目录。
9. 搜索框可以搜索书签标题。
10. 搜索框可以搜索 URL。
11. 搜索框可以搜索文件夹名称。
12. 搜索框可以搜索路径文本。
13. 清空搜索框后，可以回到原本文件夹视图。
14. 空文件夹有空状态提示。
15. 读取失败有错误提示。
16. 深色 / 浅色 / 跟随系统可以切换。
17. 刷新新标签页后，主题偏好仍然保留。
18. 刷新新标签页后，最后选中文件夹尽量恢复。

### 30.2 UI 验收

1. 页面整体不能像传统网址导航站。
2. 页面不能像后台管理系统。
3. 左侧文件夹树清晰。
4. 右侧卡片间距舒适。
5. 长标题需要省略显示，不能撑乱布局。
6. 长 URL 需要省略显示，不能撑乱布局。
7. 卡片 hover 有反馈。
8. 当前选中文件夹有明显高亮。
9. 搜索结果展示路径，用户能知道结果来自哪里。
10. 深色模式下文字对比度足够。
11. 1366px 宽度下页面可正常使用。
12. 1920px 宽度下页面不能显得太空。
13. 动画不能卡顿。
14. 搜索结果切换不能闪烁明显。

### 30.3 开源验收

1. README 信息完整。
2. LICENSE 存在。
3. `.gitignore` 正确。
4. package scripts 可用。
5. 项目可通过 `pnpm install` 安装依赖。
6. 项目可通过 `pnpm dev:chrome` 启动开发。
7. 项目可通过 `pnpm build:chrome` 构建。
8. 不提交敏感信息。
9. 不提交 node_modules。
10. 代码结构符合 SPEC。

---

## 31. 开发里程碑

### 阶段一：仓库与工程初始化

目标：

1. 克隆 GitHub 仓库。
2. 初始化 WXT + Svelte + TypeScript 项目。
3. 配置 pnpm。
4. 配置基础目录。
5. 配置 `.gitignore`、README、LICENSE。

完成标准：

1. 项目能安装依赖。
2. 项目能启动开发环境。
3. 新标签页能显示 Navo 基础页面。

提交示例：

```bash
feat: initialize navo extension
```

---

### 阶段二：新标签页与基础布局

目标：

1. 实现 Header。
2. 实现 Sidebar。
3. 实现 Main 区域。
4. 实现基础样式变量。
5. 实现浅色和深色主题基础结构。

完成标准：

1. 打开新标签页看到完整布局。
2. 页面视觉风格初步成型。

提交示例：

```bash
feat: add new tab layout
```

---

### 阶段三：书签读取与数据转换

目标：

1. 调用浏览器书签 API。
2. 获取完整书签树。
3. 转换为内部数据结构。
4. 实现文件夹和书签判断。
5. 生成路径信息。

完成标准：

1. 控制台可以打印转换后的书签树。
2. 可以正确区分 folder 和 bookmark。

提交示例：

```bash
feat: load browser bookmark tree
```

---

### 阶段四：左侧文件夹树

目标：

1. 渲染所有文件夹。
2. 支持多级缩进。
3. 支持点击选中。
4. 支持展开 / 收起。
5. 支持当前选中高亮。

完成标准：

1. 左侧能完整展示书签目录结构。
2. 点击文件夹后，选中状态正确。

提交示例：

```bash
feat: add bookmark folder sidebar
```

---

### 阶段五：右侧内容卡片

目标：

1. 渲染当前文件夹下的子文件夹。
2. 渲染当前文件夹下的网页书签。
3. 实现文件夹卡片点击进入。
4. 实现书签卡片点击打开网页。

完成标准：

1. 文件夹卡片和书签卡片区分明显。
2. 点击书签可以成功跳转。

提交示例：

```bash
feat: add folder and bookmark cards
```

---

### 阶段六：面包屑导航

目标：

1. 根据当前文件夹生成路径。
2. 显示路径层级。
3. 支持点击任意层级返回。

完成标准：

1. 进入多级文件夹后路径正确。
2. 点击上级路径可以返回。

提交示例：

```bash
feat: add breadcrumb navigation
```

---

### 阶段七：搜索功能

目标：

1. 生成扁平搜索索引。
2. 支持标题搜索。
3. 支持 URL 搜索。
4. 支持文件夹搜索。
5. 支持路径搜索。
6. 支持无结果状态。

完成标准：

1. 输入关键词后可以实时显示结果。
2. 清空关键词后恢复原视图。

提交示例：

```bash
feat: add bookmark search
```

---

### 阶段八：主题与动效优化

目标：

1. 实现浅色模式。
2. 实现深色模式。
3. 实现跟随系统。
4. 保存主题设置。
5. 优化卡片、边距、hover、空状态。
6. 添加基础过渡动画。

完成标准：

1. 主题切换正常。
2. 刷新后主题偏好保留。
3. 页面视觉完整。
4. 动画流畅。

提交示例：

```bash
style: polish theme and animations
```

---

### 阶段九：构建与文档完善

目标：

1. 完善 README。
2. 完善隐私说明。
3. 补充开发和安装说明。
4. 测试 Chrome 构建。
5. 测试 Edge 构建。
6. 预留 Firefox 构建脚本。

完成标准：

1. `pnpm build:chrome` 成功。
2. `pnpm build:edge` 成功。
3. README 可以指导用户本地安装。

提交示例：

```bash
docs: complete project documentation
```

---

## 32. README 建议结构

README 建议包含：

```md
# Navo

A clean visual bookmark workspace for your browser new tab.

## Features

- Visual bookmark folders
- New tab homepage
- Bookmark search
- Breadcrumb navigation
- Light and dark themes
- Local-first and privacy-friendly

## Tech Stack

- WXT
- Svelte 5
- TypeScript
- Vite
- CSS Variables

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

1. Open Chrome Extensions page.
2. Enable Developer mode.
3. Load unpacked extension.
4. Select the generated output directory.

## Privacy

Navo only reads your browser bookmarks locally. It does not upload, sync, or sell your data.

## Roadmap

- Firefox support
- Bookmark editing
- Workspaces
- Advanced animations
- AI-powered organization

## License

MIT
```

---

## 33. 未来版本规划

### V1

1. 新标签页替换。
2. 文件夹式书签展示。
3. 搜索。
4. 主题。
5. Chrome + Edge。

### V1.1

1. Firefox 适配。
2. 更完整跨浏览器测试。
3. Firefox Add-ons 发布准备。

### V2

1. 新增书签。
2. 编辑书签。
3. 删除书签。
4. 拖拽排序。
5. 创建文件夹。
6. 最近访问。
7. 一键打开文件夹内所有链接。

### V3

1. 工作空间。
2. 临时收藏箱。
3. 标签页保存为工作空间。
4. AI 自动分类。
5. AI 网页摘要。
6. 多设备同步。
7. WebDAV / GitHub Gist / 自建后端同步。

### V4

1. 高级动效系统。
2. 自定义主题。
3. 插件市场。
4. 个性化首页布局。
5. 更完整浏览器工作台能力。

---

## 34. 官方资料参考

以下资料用于技术选型与实现参考：

1. WXT 官方文档：说明 WXT 支持 Chrome、Firefox、Edge、Safari 以及 Chromium 系浏览器，并支持 MV2 / MV3 构建。
2. Svelte 官方文档：说明 Svelte 是编译型 UI 框架，transition 能力适合进入 / 离开 DOM 的过渡动画。
3. Chrome Extensions 官方文档：说明扩展可以通过 `chrome_url_overrides` 覆盖新标签页。
4. Chrome Bookmarks API 官方文档：说明 `chrome.bookmarks` 可用于创建、组织和操作书签。
5. MDN WebExtensions 文档：说明 `chrome_url_overrides`、`browser_specific_settings` 等 WebExtension manifest 配置。
6. Firefox Extension Workshop：说明 Firefox 发布 MV3 扩展时需要配置 `browser_specific_settings.gecko.id`。

---

## 35. 最终总结

Navo V1 是一个极简但可扩展的浏览器新标签页插件。

它不修改用户书签，只读取浏览器原生书签，并将其以文件夹树、卡片和搜索的形式重新可视化展示。

V1 的关键成功标准不是功能多，而是：

1. 打开快。
2. 看起来高级。
3. 操作顺滑。
4. 搜索好用。
5. 不破坏用户数据。
6. 代码结构适合后续扩展。
7. 能作为一个开源项目长期维护。

最终技术栈确定为：

```text
WXT + Svelte 5 + TypeScript + Native CSS + CSS Variables
```

最终仓库地址为：

```bash
git@github.com:xyzxiaoma/Navo.git
```

AI Agent 开发时应以本 SPEC 为准，完成每个阶段后自动构建、提交并推送到 GitHub。
