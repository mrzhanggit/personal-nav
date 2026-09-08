# ZCB Personal OS｜产品与开发需求文档 PRD V1.0

## 0. 产品一句话

一个以搜索为第一入口、以场景组织工具、能继续上次工作、并承载个人项目的浏览器首页。

## 1. 产品目标

### 要解决的问题

旧导航页的核心模式是“分类 → 卡片 → 点击”。随着项目与工具增加，分类越来越长，首页会逐渐变成网址仓库。

V1 要把使用路径改成：

> **我要做什么 → 搜索 / Space / Workspace → 立即进入**

### 不做什么

V1 不做：账号、数据库、云同步、RSS、天气、新闻、日历聚合、AI 对话、复杂后台管理。

## 2. 视觉母版

设计语言：**Dark Ambient Personal OS**

关键词：

- 深蓝黑 / 石墨黑
- 山湖夜景作为低对比环境背景
- 半透明 Glass UI
- 冰蓝用于选中与交互，不全局发光
- 1px 低透明度边框
- 高信息密度，但依靠层级与留白保持安静
- 轻微未来感，不做赛博朋克

### 建议 Design Tokens

```css
--bg-0: #050b14;
--bg-1: #081322;
--panel: rgba(10, 24, 42, 0.68);
--panel-strong: rgba(10, 27, 49, 0.84);
--border: rgba(148, 163, 184, 0.16);
--border-active: rgba(96, 165, 250, 0.72);
--text: #f4f7fb;
--text-2: #aebbd0;
--text-3: #718097;
--accent: #6f9cff;
--accent-soft: rgba(95, 143, 255, 0.18);
--radius-card: 20px;
--radius-control: 14px;
--blur: 18px;
```

实际开发可微调，但不要改变视觉气质。

## 3. 桌面页面布局

### Top Bar

左：Logo + `ZCB / PERSONAL OS` + `A MORE FOCUSED, MORE ME`

右：搜索按钮 / 时间 / 设置 / 头像（头像 V1 可静态）

### Sidebar

固定左侧，约 72–84px：

首页 / 收藏 / 应用 / 项目 / 快速 / 更多。

Hover 时增强背景与文字，不做大幅位移。

### Hero

主标题：`下午好，今天想做什么？`

副标题：`专注当下 · 构建更好的自己`

搜索框是首屏视觉焦点。

### Space Row

六个 chips；当前项冰蓝选中。

### Main Bento

当前 Space 展开，其余紧凑。

### Continue

3 个横向任务卡。

### Recent

5 个最近入口 + 查看全部。

## 4. 核心功能验收

### 4.1 Command Search

- [ ] `⌘K` 和 `Ctrl+K` 均能打开
- [ ] 输入后 100ms 内给出本地搜索结果
- [ ] 支持名称 / description / tags / aliases
- [ ] ↑↓ + Enter 全键盘可操作
- [ ] 搜索结果可显示所在 Space 与 Kind
- [ ] 打开资源时自动更新 Recent

### 4.2 Space Bento

- [ ] 六个 Space 全部存在
- [ ] 同一时刻只能展开一个
- [ ] 切换时布局平滑过渡
- [ ] 展开卡片展示最多 8 个高优先级资源
- [ ] “探索更多”进入该 Space 完整资源视图

### 4.3 Favorites

- [ ] 每个资源可收藏/取消收藏
- [ ] 状态保存 localStorage
- [ ] 收藏页面可查看全部

### 4.4 Recent

- [ ] 自动记录最近打开资源
- [ ] 同一资源再次打开更新时间而不是重复新增
- [ ] 默认保留最近 30 项，首页显示 5 项

### 4.5 Continue

- [ ] 读取静态配置
- [ ] 首页最多显示 3 项
- [ ] 支持进度、动作文案、最近编辑时间等不同呈现

### 4.6 Workspaces

- [ ] 支持工作/学习/投资/创作四组
- [ ] 点击先显示将打开项目清单
- [ ] 用户确认后逐项打开
- [ ] 某链接不可用时不影响其他链接

## 5. 数据结构

V1 先使用 TS/JSON 配置文件，不要写死在 JSX。

```text
data/
├── resources.ts
├── spaces.ts
├── workspaces.ts
└── continue.ts
```

用户偏好放 localStorage：

```text
zcb-os:favorites
zcb-os:recent
zcb-os:active-space
zcb-os:preferences
```

## 6. 技术栈

基于现有 GitHub Pages 静态仓库：

- Vite
- React
- TypeScript
- Tailwind CSS
- Motion（Framer Motion 的现名/React 动效库，按当前包实际 API）
- Lucide React
- Fuse.js

不要引入服务端依赖。

## 7. 现有静态子站兼容

现有这些内容必须原 URL 继续可访问：

```text
timeline/**
python-course/**
claude-code-course.html
cli-course.html
```

建议迁移到 `public/`，让 Vite build 时原样复制到 `dist/`。

现有 `links.json` 保存为 legacy 备份；新 UI 使用新 schema。

## 8. GitHub Pages 路径

线上入口是 `/personal-nav/`，构建必须在该子路径下工作。

Vite `base` 要按最终部署方式设置，所有内部链接不得错误跳到域名根目录。

建议统一通过：

```ts
const base = import.meta.env.BASE_URL
```

处理内部静态页面路径。

## 9. 响应式

### Desktop ≥ 1280
完整 Sidebar + Bento。

### Tablet 768–1279
Sidebar 收窄，Bento 变为 2 列。

### Mobile < 768
- Sidebar 改底部导航或顶部抽屉
- Search 仍保持最重要
- Space 改横向滑动 chips
- 卡片纵向堆叠
- 禁止为了复刻视觉图而缩小桌面 UI

## 10. 动效

- hover：150–220ms
- Space layout：300–420ms
- Command Palette：180–240ms
- 卡片 hover 位移不超过 2–3px
- 只有 active / focus 才允许明显冰蓝 glow
- 支持 reduced motion

## 11. 背景

开发阶段优先用：

1. 一张独立干净的深色山湖背景图；或
2. CSS gradient + 暗纹理占位。

不要直接把完整 UI 概念图当网站背景。

背景必须叠加暗色遮罩，内容优先级高于风景。

## 12. 迁移阶段

### Phase A：安全基线
- 新建 `redesign/personal-os-v1` 分支
- 不改 main/gh-pages
- 保存旧 `links.json`
- 确认旧子站清单

### Phase B：骨架
- Vite React TS
- Sidebar / Topbar / Hero / Space grid
- 静态数据

### Phase C：交互
- ⌘K
- Favorites
- Recent
- Continue
- Workspaces

### Phase D：迁移
- 23 条旧资源导入新 schema
- 静态子站复制进 public
- 逐个验证内部链接

### Phase E：视觉精修
- 背景
- Glass
- 动效
- 响应式

### Phase F：部署
- 先 Preview
- 再替换线上 dist
- 最后更新 gh-pages

## 13. Definition of Done

只有同时满足以下条件才算 V1 完成：

- 原 23 个资源全部可从新版找到；
- 旧静态子页面没有因重构产生 404；
- 首页视觉与 V2 母版气质一致；
- ⌘K、Favorites、Recent、Continue、Workspace 均可用；
- 页面刷新后 localStorage 状态不丢；
- 桌面/手机均可正常使用；
- Lighthouse 不出现明显可访问性与性能红线；
- `npm run build` 可稳定生成 GitHub Pages 可发布的 `dist/`。
