# Phase C2b — Favorites

基于已验收提交 `bd612b1`，开发分支 `redesign/personal-os-v1`，开始时工作区干净。用户已确认 C2b 人工验收通过，并授权本阶段收尾及独立 Git 提交。仅实现收藏及 Sidebar 收藏视图；未 push、未部署、未进入下一阶段。

未实现 Continue、Workspace 或 Space 完整业务页；Recent 的存储和打开语义保持不变。

## 状态与结构

- `src/lib/favorites.ts`：唯一收藏存储领域层，key 为 `zcb-os:favorites`，数组元素仅 `{ resourceId, favoritedAt }`。
- 去重、最近收藏优先、取消后重新收藏置顶。读取时过滤无效 ID、非法时间、重复数据；JSON 损坏或存储不可用时降级为空或内存状态。
- `FavoritesProvider` + `useSyncExternalStore` 在本 App 内即时同步收藏按钮与视图；无默认收藏，无跨标签页同步或云同步。
- 资源所有展示字段继续读取真实 JSON 数据；资源从数据源消失后不展示，重新加载时过滤。
- `ResourceItem` 复用原 `ResourceAnchor` 和资源样式，为首页展开资源与收藏页提供紧凑/详细两种呈现；`FavoriteButton` 同时服务首页、搜索和收藏页。
- App 的 `home | favorites` 状态驱动 Sidebar 和内容切换，无 Router，不修改 URL，不刷新页面。刷新回到 Home，收藏仍持久化。

## 交互

资源链接是主操作，星标是独立次级按钮，提供 aria-label 和 aria-pressed。未收藏时低对比，hover/focus 增强；已收藏常显。详细卡片展示 Icon、名称、描述、Space 和打开文案。没有收藏时显示真实空状态。

Command Palette 搜索算法未修改。为容纳可聚焦星标，结果语义改为 grid/row/gridcell，主打开区域与星标位于独立单元格，避免在 listbox option 内嵌交互按钮。输入框保留 ↑↓、Enter、IME 处理；Tab/Shift Tab 在输入框、关闭按钮、结果星标之间循环，Esc 关闭。星标 Enter/Space 不触发打开。

收藏和 Recent 独立。收藏/取消不更新 Recent；资源打开继续通过 `ResourceAnchor` 调用原 store 的 `openResource()`，搜索仍复用 `useOpenResource()`。C2a 的 key、记录格式、容量和打开语义未改。

## 验证

- 自动测试 28/28：原 20 项，加 8 项 Favorites 测试，涵盖首次/重复/取消/重新收藏、恢复与排序、损坏存储、无效和移除 ID、异常读写、全部 23 资源、订阅同步、与 Recent/旧 CLI 状态隔离及打开路径。
- Chrome 实际交互：Home → Favorites → Home，诚实空状态，首页收藏，搜索 Tab 到星标后 Space 收藏，跨视图即时同步，刷新恢复及顺序，搜索取消同步首页，Favorites 链接打开课程并更新 Recent，取消最后一项返回空状态。
- 键盘回归：Sidebar Enter、星标 Space、搜索方向键/Enter/Esc；搜索打开课程新标签页成功。视图切换保持原 URL。
- 1470px 桌面和 390px 手机检查首页及收藏视图；手机 scrollWidth = 390，无横向溢出。浏览器控制台无 error/warn。
- `npm run build`、`npm run verify:legacy`、`npm test`、`git diff --check` 均通过；根目录、public、dist、隔离构建各 53/53 legacy hash 通过。
- public legacy resources、dist、GitHub Actions、部署配置、旧课程及 `cli-course.save.v1` 未修改；无新依赖。

本地开发预览：<http://127.0.0.1:5174/personal-nav/>。
