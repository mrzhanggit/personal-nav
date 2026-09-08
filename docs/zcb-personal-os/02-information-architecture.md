# ZCB Personal OS｜信息架构 V1.0

## 1. 全局导航

左侧 Dock：

- 首页 Home
- 收藏 Favorites
- 应用 Apps
- 项目 Projects
- 快速 Workspaces
- 更多 More

其中“应用”和“项目”不是同一个概念：

- **应用**：ChatGPT、Claude、飞书、TradingView 这类工具入口。
- **项目**：你自己创建的历史地图、课程、资产看板、素材库等作品。

## 2. 首页结构

1. Top Bar
2. Greeting
3. Command Search（全站第一入口）
4. Space Chips
5. Bento Accordion（同一时刻只展开一个 Space）
6. Continue
7. Recent

首页不展示完整“网址全集”。完整资源通过 `⌘K`、Apps、Projects 获取。

## 3. 六大 Space

### AI 工具 `ai`
对话模型、AI 编程、命令行、开发学习、AI Agent。

### 医院工作 `work`
飞书、OA、HIS、医保、公卫、家医、文献与行政常用入口。

### 阅读学习 `learn`
历史、阅读、播客、文章档案、语言学习、课程。

### 投资研究 `invest`
资产、行情、公司研究、BTC、投资大师、研报与投资资料。

### 创作项目 `create`
写作、PPT、图片、视频、网页开发与发布工具。

### 生活 `life`
家庭、习惯、影音、旅行、生活工具。

## 4. 二维组织模型

不要再只靠 `category`。

推荐每条资源至少有：

```ts
type Resource = {
  id: string
  name: string
  description?: string
  url: string
  icon?: string

  space: 'ai' | 'work' | 'learn' | 'invest' | 'create' | 'life'
  kind: 'app' | 'learning-project' | 'course' | 'archive' | 'dashboard' | 'resource' | 'audio-project'
  category: string
  tags: string[]
  aliases?: string[]

  favorite?: boolean
  hostingType?: 'internal-static' | 'github-pages' | 'custom-domain' | 'sandbox-domain' | 'external'
}
```

这使搜索可以同时理解“它用来干什么”和“它本身是什么”。

## 5. Command Palette

快捷键：`⌘K` / `Ctrl+K`

搜索范围：

- 资源名称
- 描述
- tags
- aliases
- Space
- Project
- Workspace

支持：

- 键盘 ↑ ↓ 选择
- Enter 打开
- `⌘ + Enter` 新标签页
- Esc 关闭
- 最近使用优先排序
- 收藏优先排序

V1 可用 Fuse.js 做模糊检索，无需 AI。

## 6. Continue

Continue 是“正在推进的对象”，不是历史浏览记录。

V1 人工配置：

```ts
{
  id: 'odyssey',
  title: '《奥德赛》',
  action: '继续阅读',
  progress: 56,
  url: '...'
}
```

最多首页展示 3 个。不要自动接第三方服务。

## 7. Recent

自动记录：

- resourceId
- lastOpenedAt
- openCount

存 localStorage，默认展示最近 5 个。

## 8. Workspaces

“一次进入一个工作场景”。

V1 四组：

- 开始工作
- 开始学习
- 投资研究
- AI 创作

点击后先弹确认/预览将打开的链接，避免浏览器一次弹出大量窗口被拦截。

## 9. Bento Accordion

桌面端：

- 当前 Space 占约 40% 主区域宽度并展开 2 行资源；
- 其他 Space 为紧凑卡片；
- 点击其他卡片时，当前卡片缩回、目标卡片展开；
- 300–420ms 弹性动画；
- `prefers-reduced-motion` 时关闭位移动画。

移动端：改为纵向卡片，不强行保留桌面 Bento 几何结构。
