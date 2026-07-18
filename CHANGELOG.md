# Changelog

## 1.1.0

- 新增书签快速定位，可按文件夹、书签标题、域名、网址和目录路径搜索，并支持键盘操作。
- 增强左侧目录筛选与滚动联动，深层匹配会保留祖先路径，主动跳转时提供明确定位反馈。
- 优化浅色、深色和窄屏布局下的搜索结果展示与可访问性。
- 统一项目包与浏览器扩展清单的版本来源，并增加连续语义版本、中文更新说明和历史记录保护。
- 调整 GitHub Release 流程，使用稳定版本标签和本地中文变更说明，并限制未经明确批准的主版本发布。

## 1.0.1

- 增加顺序稳定的固定书签区，以及按打开时间排列的最近书签区。
- 将书签页改为全部文件夹紧凑总览，减少逐层切换和大卡片带来的定位成本。
- 增加目录滚动索引与显式整理模式，让日常浏览界面隐藏编辑、删除和排序操作。
- 完善设置迁移、写入串行化、键盘搜索建议与窄屏响应式体验。

## 1.0.0

- Initialize Navo as a WXT + Svelte 5 + TypeScript browser extension.
- Add Manifest V3 new tab override for Chrome and Microsoft Edge.
- Request only `bookmarks` and `storage` permissions.
- Load and normalize the native browser bookmark tree.
- Render folder navigation with nested sidebar rows, breadcrumbs, folder cards, and bookmark cards.
- Add in-memory global bookmark search with grouped folder and bookmark results.
- Add light, dark, and system theme modes with local persistence.
- Persist the last selected folder and sidebar collapsed preference locally.
- Add loading, empty, no-result, and error states.
- Complete open source docs for local development, local installation, privacy, and roadmap.
