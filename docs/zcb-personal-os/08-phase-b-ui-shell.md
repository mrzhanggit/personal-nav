# Phase B — Personal OS UI Shell

本阶段仅完成首页静态视觉骨架。Phase B、B.1、B.2 已通过人工验收，当前版本确认为 ZCB Personal OS V1 的 UI Visual Baseline，获准独立提交；不进入 Phase C。

## 组件与数据

- `src/App.tsx`：App Shell 与低对比 CSS 山湖环境。
- `src/components/Shell.tsx`：Sidebar、Top Bar、Footer。
- `src/components/Home.tsx`：Hero、Command Search 外观、Space Chips、Bento Grid、Continue / Recent 空状态。
- `src/components/Icon.tsx`：轻量内联 SVG 线性图标。
- `src/styles.css`：玻璃卡片、响应式布局、200ms hover 与 reduced-motion 适配。

首页直接读取 `links.v1.json` 和 `spaces.v1.json`，资源计数按实际数据计算。默认 AI 工具展开，其他空间显示最多三个真实入口摘要（手机最多两个），不代表完整资源列表。医院工作、创作项目为空。Continue、Recent 不生成假进度或假记录，不读写 localStorage。

真实资源链接支持打开；搜索、设置和非首页导航尚未开放。Space Chips 仅展示默认状态，没有切换功能；⌘ K 只展示快捷键外观，未绑定命令面板。Top Bar 时间取页面渲染时本机时间，尚未增加持续时钟逻辑。

## 视觉与验收

保留母版的居中问候、搜索入口、左侧主卡片与右侧紧凑卡片层级。背景使用 CSS 渐变及低对比抽象山湖轮廓，不是摄影背景，不加载 `visual-v2.png`。资源图标取原 JSON 的 emoji，没有虚构 App 图标或网址。主卡片与当前导航使用克制冰蓝，其余卡片保持灰蓝色。

本地预览：`npm run dev -- --host 127.0.0.1`，访问 `http://127.0.0.1:5173/personal-nav/`。若端口已占用，以终端实际输出为准。

已检查 1440px、1680px、1024px 和 390px 浏览器布局，无横向溢出；手机使用底部导航和纵向网格。搜索、各业务页面、完整 Space 切换、最终手机体验均留待后续明确授权。系统字体与 emoji 的具体外观会因设备而不同。

最终精修保留静态远山雾感与微弱水平环境光，降低普通卡片描边及 active 蓝光，缩小并降低 emoji 饱和度，移除独立的左上角 Z/ 标记。1680×900 下 Continue、Recent 均完整可见。数据、URL 和业务逻辑保持不变。

继续使用既有 `npm run build`、`npm run verify:legacy`、`npm test`。构建仍输出 `.phase-a-build/`，不修改原 `dist/`、`public/` 旧资源、根目录旧文件、清单或发布配置。本阶段没有安装依赖。
