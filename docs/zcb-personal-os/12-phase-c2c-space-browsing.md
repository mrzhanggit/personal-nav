# Phase C2c — Space Browsing

基于稳定提交 `478ac39`，分支 `redesign/personal-os-v1`，开始时工作区干净。仅实现六大 Space 内部浏览。用户已确认 C2c 人工验收通过，并授权本阶段收尾与独立 Git 提交；不 push、不部署、不进入下一阶段。

## 架构与范围

- App 使用判别联合状态：Home、Favorites 或带 spaceId 的 Space。共享 Favorites / Recent / Palette Provider 位于视图外，切换不重置状态、不修改 URL、不刷新页面。刷新仍回到 Home。
- `SpaceChips` 复用于首页与 Space View；Space View 用 aria-current 和克制的冰蓝边框标示 active，字号和视觉权重低于 Space 标题、描述、资源数量。
- 首页 Bento 标题提供原生按钮，卡片非资源区域也可进入 Space；资源链接和收藏按钮保持独立操作，不触发卡片导航。
- `SpaceView` 读取真实 Space 标题、图标、subtitle 和实时资源计数；完整资源全部复用原 `ResourceItem` 的 detailed 模式，没有复制资源组件。
- `resourcesForSpace()` 只按真实资源 space 字段筛选，保留原对象与原顺序。没有新增资源、category、搜索、分组、排序或筛选器。
- 六大 Space 数量：AI 工具 4、医院工作 0、阅读学习 15、投资研究 3、创作项目 0、生活 1。总计 23，每条仅属于自己的 Space；空 Space 显示“尚未添加资源”。
- Sidebar 不新增条目；Space View 中 Home/Favorites 均不 active，首页按钮正常返回。Space View 另有低权重返回首页按钮。
- 视图切换后将键盘焦点移到 main，避免入口卸载后焦点丢失；Chips、Bento 标题均为原生 button，可 Tab 和 Enter 操作。

Favorites、Recent、ResourceItem、Command Palette 及搜索算法实现均未修改。收藏/取消只更新 Favorites；打开仍由 ResourceAnchor 调用原 openResource() 并更新 Recent。

未实现 Continue、Workspace、Apps/Projects 完整页、AI 命令、自定义 Space、URL 路由、云同步或其他后续功能。

## 验证

- 自动测试 31/31：原 28 项，加 3 项覆盖六大 Space 对 23 条真实资源的唯一完整映射、顺序/空 Space、收藏与 Recent 隔离及内部打开路径。
- Chrome 浏览器逐一验证首页六个 Chips 与六个 Bento 标题入口（12 个入口）均进入对应 Space；卡片非按钮区域也能进入，收藏按钮不会触发卡片导航。
- 逐个切换六个 Space，验证资源数量 4/0/15/3/0/1、两处真实空状态及 active 标记。返回首页、Home/Favorites/Space 切换保持原 URL。
- 手机端 Space 收藏 CLI 后，收藏页与首页立即同步；Recent 中仍没有 CLI。Space 中打开 CLI 后，新标签页为原课程路径，Recent 出现 CLI；取消收藏后 Recent 仍保留。
- 实测 Space Chips Tab/Enter 切换和焦点落在 main；控制台无 error/warn。
- 阅读学习完整 15 项资源在 1680、1440、1024、390px 均检查截图和 DOM 宽度，无横向溢出。对应网格为 3/3/2/1 列；手机 Chips 换行、标题不挤压，收藏按钮可点击。
- `npm run build`、独立 `npm run verify:legacy`、`npm test`、`git diff --check` 通过。根目录、public、dist、隔离构建各 53/53 legacy 资源受保护。
- public legacy、dist、GitHub Actions、部署配置、旧课程和 `cli-course.save.v1` 未修改。无新增依赖。

本地开发预览：<http://127.0.0.1:5174/personal-nav/>。
