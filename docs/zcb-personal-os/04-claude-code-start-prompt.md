> **本文件是早期 Claude Code 开发提示词。**
> 当前项目实际使用 Codex 开发。
> 任何执行均必须优先遵守：
> [05-phase-a-b-safety-baseline.md](05-phase-a-b-safety-baseline.md)。

# Claude Code 启动 Prompt｜ZCB Personal OS V1

请先完整阅读本 Prompt，再开始改代码。你现在不是在新建一个普通导航站，而是在已有 `personal-nav` Git 仓库上完成一次**安全重构**。

## 你的角色

你是资深前端架构师 + 交互设计工程师。你的目标是把现有“我的学习导航”升级为：

> **ZCB / PERSONAL OS — Search-first 的个人数字入口**

要求最终结果既要有高端视觉，也必须每天好用、容易维护。

## 先做的事情（必须按顺序）

1. 阅读当前仓库结构、`links.json`、`nav.html`、`dist/`、`.github/workflows/`。
2. 阅读这些规划文件：
   - `docs/zcb-personal-os/01-current-site-audit.md`
   - `docs/zcb-personal-os/02-information-architecture.md`
   - `docs/zcb-personal-os/03-prd-v1.md`
3. 检查 Git 当前分支和工作区状态。
4. 如果当前在 `main`，新建并切换：
   `redesign/personal-os-v1`
5. 在任何删除、移动旧文件之前，先列出迁移计划给我确认。

## 不可破坏约束

以下旧内容必须保持可访问：

- `timeline/**`
- `python-course/**`
- `claude-code-course.html`
- `cli-course.html`

现有 23 个导航条目必须全部迁移；不能因为新设计而丢失。

不要直接删除旧 `links.json`。先备份为 legacy 数据。

## 技术栈

使用：

- Vite
- React
- TypeScript
- Tailwind CSS
- Motion / Framer Motion
- Lucide React
- Fuse.js

不要引入 Next.js，不要引入数据库，不要引入服务端。

## 数据原则

所有资源都必须配置驱动，不要把网址写死在组件 JSX 中。

采用：

```ts
type Resource = {
  id: string
  name: string
  description?: string
  url: string
  icon?: string
  space: 'ai' | 'work' | 'learn' | 'invest' | 'create' | 'life'
  kind: string
  category: string
  tags: string[]
  aliases?: string[]
  favorite?: boolean
  hostingType?: string
}
```

规划包里的 `data/links.v1.json` 是旧 23 条资源的迁移草稿，以它为基础，不要重新手工猜分类。

## 页面结构

桌面端：

```text
Topbar
Sidebar
Hero Greeting
Command Search
Space Chips
Bento Accordion
Continue
Recent
```

Sidebar：

- 首页
- 收藏
- 应用
- 项目
- 快速
- 更多

六大 Space：

- AI 工具
- 医院工作
- 阅读学习
- 投资研究
- 创作项目
- 生活

## 最重要的交互

### 1. Command Palette

- `⌘K` / `Ctrl+K`
- Fuse.js 模糊搜索
- 搜索 name / description / tags / aliases
- ↑↓ 选中
- Enter 打开
- Esc 关闭
- 打开资源自动写入 Recent

### 2. Bento Accordion

同一时间只展开一个 Space。

当前 Space 视觉更大，显示最多 8 个资源；其他 Space 紧凑。

点击另一个 Space 时，使用 Motion 做 300–420ms 的平滑 layout 动画。

### 3. Favorites

使用 localStorage。

### 4. Recent

使用 localStorage，去重并记录 lastOpenedAt/openCount。

### 5. Continue

V1 用静态配置，不连接第三方服务。

### 6. Workspaces

四组：工作 / 学习 / 投资 / AI 创作。

点击后先预览将打开的链接，再执行批量打开，避免直接触发浏览器 popup block。

## 视觉规范

视觉方向：**Dark Ambient Personal OS**。

不是普通黑色网页，也不是赛博朋克。

必须体现：

- 深蓝黑夜景
- 低对比山湖环境背景
- 半透明玻璃卡片
- 1px 极细边框
- 冰蓝只用于 active / focus
- 克制 glow
- 充足留白
- 精密、有秩序的信息层级

建议 tokens：

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
```

不要：

- 满屏霓虹
- 粒子特效
- 鼠标拖尾
- 大幅 3D 翻转
- 所有卡片同时发光

## GitHub Pages

站点最终运行于 `/personal-nav/`。

Vite 必须正确配置 `base`，内部静态页面 URL 必须兼容这个路径。

推荐把旧静态内容放进 `public/`，使 build 后仍按原 URL 出现在 `dist/`。

## 开发节奏

不要一次完成所有功能。

按下面六步，每完成一步都先运行检查，并向我汇报结果：

1. 安全迁移与项目骨架
2. 首页静态布局
3. Bento / Space 动效
4. Command Palette
5. Favorites / Recent / Continue / Workspaces
6. 响应式 + 构建 + 链接回归测试

每一步都要：

- `npm run build`
- 检查控制台错误
- 不破坏旧页面
- 再进入下一步

## 第一轮任务

现在只完成：

> **Phase A + Phase B：安全迁移 + 首页静态骨架。**

暂时不要实现所有复杂交互。

完成后告诉我：

1. 你读到了什么现有结构；
2. 你做了哪些迁移；
3. 哪些旧文件被保留；
4. 新目录结构；
5. build 是否通过；
6. 下一步准备做什么。
