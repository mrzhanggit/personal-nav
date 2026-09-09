# Phase C2a — 最近使用

2026-09-09 完成 Recent 实现与检查，用户已确认 C2a 人工验收通过，并授权本阶段收尾及独立 Git 提交。未 push、未部署，未进入 C2b。

本阶段仅实现最近使用；未实现 Favorites、Continue 或 Workspace。public legacy resources、dist、GitHub Actions、部署配置及 `cli-course.save.v1` 均未修改。

## 功能

- 首页资源、搜索结果和最近使用列表共用访问记录逻辑；仅打开时记录，搜索与浏览列表不记录。
- localStorage key 为 `zcb-os:recent-resources`，只存 resourceId、lastOpenedAt、openCount。重复打开累加次数并移到首位；首页显示最近 5 项。
- 延续续接时实现的 20 项保留上限（早期 PRD 写的是 30 项）；本次没有擅自改动已有实现的容量选择。
- 损坏数据、无效资源、重复记录和非法字段会过滤；存储不可用时使用内存记录，不阻止打开。
- 首页和 Recent 使用原生链接导航，保留中键及组合键行为；搜索仍用新标签页打开。资源标题提示保留描述。
- 右键菜单中的打开由浏览器处理，不计入记录；跨标签页不实时同步；相对时间在组件渲染时计算。

## 验证

- `npm test`：20 项通过，覆盖搜索、访问次数、去重排序、20 项上限、刷新恢复、异常存储及 legacy 保护。
- `npm run build`：TypeScript 和 Vite 构建通过；输出到 `.phase-a-build/`。
- legacy 校验：根目录、public、dist、隔离构建的 53 个受保护资源均通过；旧 CLI 存储 key 保持不变。
- Chrome 实测：首页点击后显示记录、刷新后保留；搜索 Python 并按 Enter 后记录置顶；中键重开 Claude Code 后置顶且不重复。课程新标签页标题和 `/personal-nav/` 路径正确。
- 桌面 1470px、手机 390px 检查 Recent 排列与文字显示；手机 document scrollWidth 等于视口 390px，无横向溢出。

本地预览：`http://127.0.0.1:5174/personal-nav/`（5173 已被占用）。
