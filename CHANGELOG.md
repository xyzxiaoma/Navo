# Changelog

## 1.2.1

- 优化书签页目录栏展开与收起动画，避免内容区域反复重排造成卡顿。
- 调整目录栏恢复按钮的位置与过渡节奏，使收起后的操作入口更自然且保持可点击。
- 支持减少动态效果和窄屏场景直接切换，并避免快速连续操作叠加动画。

## 1.2.0

- 新增固定区书签选择器，可在整理模式中直接搜索现有书签并添加到首页固定区。
- 支持方向键选择、回车添加和 Esc 关闭，并自动排除已固定书签。
- 完善固定区满额、移除和排序后的交互状态，避免保存完成后管理按钮持续禁用。

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
