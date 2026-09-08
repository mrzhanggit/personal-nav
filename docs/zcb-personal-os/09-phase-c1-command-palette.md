# Phase C1 — Command Palette

本阶段仅实现真实资源搜索与打开，等待人工体验；不暂存、不提交、不部署、不进入 C2。

## 结构与范围

`CommandPalette.tsx` 提供共享入口、原生模态 dialog、选中状态和焦点管理；`command-palette.css` 延续现有玻璃材质。`src/lib/search.ts` 提供索引、排序、URL helper 及键盘动作映射。首页和 Top Bar 使用同一触发组件。

只读取既有 `links.v1.json`、`spaces.v1.json`，全部 23 条资源均进入索引。空查询按原数据顺序列出全部资源，列表滚动；空结果不推荐虚构内容。没有 localStorage、历史记录、Favorites、Recent、Continue 或 Workspace 逻辑，没有新增依赖。

## 搜索规则

文本做 NFKC、大小写与空白归一化，优先级为标题精确、标题前缀、标题包含、真实 tags/keywords/aliases、description、Space/category，然后多词匹配和简单模糊匹配。模糊匹配对三个及以上字符的词允许一次插入、删除或替换，例如 `pyton`；不提供拼音、语义搜索或 AI 命令。同分按原数据顺序。

## 交互与路径

点击任一入口或 ⌘K / Ctrl K 打开；快捷键再次按下、Esc、关闭按钮、遮罩关闭。输入自动聚焦，Tab / Shift Tab 在输入和关闭按钮间循环；原生模态 dialog 阻止背景交互，打开时锁定 body 滚动，关闭恢复原 overflow 和实际触发入口焦点。快捷键从其他已聚焦元素触发时返回该元素，无聚焦元素时回到首页搜索入口。

输入改变重置选中项；↑↓ 循环选择并滚动到选中行，鼠标移入同步选中。输入法组合期间不将 Enter/方向键当作资源操作。结果使用 listbox / option / aria-selected 和 combobox 的 aria-activedescendant。

Enter 或点击结果使用 `window.open(url, '_blank', 'noopener,noreferrer')`，不记录访问。内部静态 URL 通过 `import.meta.env.BASE_URL` 拼接；外部 HTTP(S) URL 原样保留。首页原有资源链接复用相同 helper。

## 验证

- `npm test`：6 项搜索/键盘/路径测试，加上原 6 项 legacy 测试，共 12 项通过。
- 自动检查全部 23 条资源逐一可检索、中文/英文/大小写/部分词/拼写容错/空结果/排序、方向键边界、IME 动作抑制和内外路径。
- 浏览器交互检查：两个入口开关与焦点恢复、自动 focus、Tab 循环、⌘K/Ctrl K、Esc、遮罩关闭、方向键、空结果与 Space 搜索。
- Enter 实际打开开发服务的 Python 课程、构建 preview 的 Claude Code 课程，均带 `/personal-nav/`。
- 1440px 和 390px 弹层检查无横向溢出，控制台无错误。浏览器交互检查未引入 DOM 测试框架；自动测试负责纯逻辑，交互仍须人工回归。
- build、legacy 53/53、`git diff --check` 通过；保护资源及发布配置无变化。

开发预览：`http://127.0.0.1:5173/personal-nav/`。
构建预览：`npm run preview -- --host 127.0.0.1 --port 4173`，访问 `http://127.0.0.1:4173/personal-nav/`。
