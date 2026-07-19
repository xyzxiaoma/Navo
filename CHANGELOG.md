# Changelog

## 1.3.2

- 将不可用的 Google 搜索联想替换为 Bing 实时联想，并同步切换首页搜索跳转与扩展域名权限。
- 支持最多 9 条紧凑搜索建议，保留本地书签优先展示、输入防抖、请求取消和结果缓存。
- 增加 Bing 双端点与页面直连、后台消息备用链路，并在请求失败时显示可诊断的错误信息。

## 1.3.1

- 将首页匹配书签改为紧凑卡片网格，桌面单行展示 5 项，并针对平板和手机自动调整为 3 列或 2 列。
- 区分“匹配书签”与“搜索与建议”结果区域，同时保留原始搜索操作和 Google 搜索联想。
- 延续统一键盘选择顺序、无障碍状态和主题样式，避免网格化影响现有搜索交互。

## 1.3.0

- 首页搜索新增浏览器书签联想，可按标题、网址、域名和目录路径匹配，并固定显示在 Google 建议之前。
- 接入实时 Google 搜索词建议，支持输入防抖、旧请求取消、结果缓存和网络失败静默降级。
- 完善统一联想列表的键盘操作、无障碍状态、站点图标和窄屏展示，打开书签时继续记录最近访问。
- 限制完整网址、域名、localhost、IP 地址和过长文本的联想请求，并补充最小域名权限与隐私说明。

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
