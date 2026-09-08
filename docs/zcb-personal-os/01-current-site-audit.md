# ZCB Personal OS｜现有站点审计与迁移结论 V1.0

## 1. 已审计范围

来源：用户上传的 `personal-nav.zip`。

当前导航数据源为 `links.json`，页面由 `nav.html` 动态读取；发布目录 `dist/` 内保留同结构副本。仓库中还包含历史时间线、Claude Code/CLI 课程、Python 游戏化课程等静态子站。

### 当前规模

- 旧分类：**9 个**
- 导航条目：**23 个**
- 仓库总体：约 **6.2 MB**
- 当前导航实现：单页 HTML + CSS + 原生 JS + `links.json`
- 当前仓库远程：`mrzhanggit/personal-nav`

## 2. 最关键的产品发现

旧站名称是“我的学习导航”，但实际已经不只是网址导航。23 个入口中，大量条目是你自己生成或持续维护的**学习应用、交互历史项目、课程、素材档案和个人看板**。

因此新版不能简单地把旧 9 个分类换成 6 个新分类。更合理的数据模型是把三个维度拆开：

1. **Space（使用场景）**：AI / 工作 / 学习 / 投资 / 创作 / 生活
2. **Kind（资源类型）**：app / project / course / archive / dashboard / resource
3. **State（当前状态）**：favorite / recent / continue / archived

这样，一个“美国历史学习地图”既可以属于“阅读学习” Space，又可以在左侧“项目”中被找到；“个人资产看板”既属于“投资研究”，又属于“Dashboard”。

这会比单一分类体系更稳定。

## 3. 现有内容映射结果

| 新 Space | 当前条目数 | 说明 |
|---|---:|---|
| AI 工具 | 4 | Claude Code / CLI / Python / Git 游戏化课程 |
| 医院工作 | 0 | 旧导航尚未收录真实工作入口，V1 留出位置 |
| 阅读学习 | 15 | 当前最重的内容区：文明史、历史时间线、文章档案、英语学习 |
| 投资研究 | 3 | RWH、财商、资产看板 |
| 创作项目 | 0 | 旧链接不宜强行归入此处；“项目”作为独立 Kind 维度呈现 |
| 生活 | 1 | 习惯力工作台 |

### 资源类型

- `learning-project`：13
- `audio-project`：1
- `archive`：3
- `course`：4
- `dashboard`：2

## 4. 托管结构审计

按 URL 形态统计：

- `sandbox-domain`：6
- `github-pages`：5
- `internal-static`：10
- `custom-domain`：2

其中 `agentos-app.net`、`workbuddy.link`、`qwenwork.host` 这类沙箱/临时域名应当标记为**迁移优先级较高**，原因不是现在一定失效，而是它们不适合作为 Personal OS 的长期基础入口。

仓库自带部署说明还记录了两个需要注意的历史事项：

- `workbuddy.link` 曾出现平台级 502；
- “更富有、更睿智、更快乐”播客条目的原沙箱地址曾被其他内容复用，需要重新确认去留。

因此新版的数据模型中应加入 `hostingType` / `status` 字段，后续可以做“失效链接检查”。

## 5. 技术结论：调整此前的技术建议

在没有看到源码前，曾考虑 Next.js。审计现有仓库后，V1 **更建议：Vite + React + TypeScript + Tailwind CSS + Motion**。

原因：

- 当前本质是 GitHub Pages 静态站；
- 不需要 SSR；
- V1 不登录、不接数据库；
- 需要大量客户端交互（Command Palette、localStorage、卡片展开）；
- Vite 静态构建更直接，也更容易保留现有 `timeline/`、`python-course/` 等静态页面；
- 后续真的需要账号、云同步、API 时，再升级后端即可。

## 6. 迁移时绝不能破坏的内容

- `timeline/` 整个目录
- `python-course/` 整个目录
- `claude-code-course.html`
- `cli-course.html`
- 现有 23 个链接条目的原始标题、描述、URL
- GitHub Pages 的 `/personal-nav/` 子路径兼容

建议新建分支开发，不直接覆盖线上版本。

## 7. 第一阶段结论

新版不是“学习导航 V2”，而应正式升级为：

> **ZCB / PERSONAL OS — 个人数字入口与持续工作台**

首页只承担五件事：**Search / Space / Continue / Recent / Workspace**。

全部 23 个旧项目不应该强塞首页，而应由搜索、Space 与“项目”视图按需出现。
