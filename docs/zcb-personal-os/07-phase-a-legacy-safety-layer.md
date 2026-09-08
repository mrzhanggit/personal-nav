# Phase A — Legacy Safety Layer

## 工程范围

本阶段只建立 Vite、React、TypeScript 最小工程与旧资源保护层。首页仅有项目名称，不包含 Phase B 布局、交互或业务数据，不使用视觉母版作为背景或数据源。尚未实现新存储；后续必须使用 `zcb-os:*`，不得操作旧课程的 `cli-course.save.v1`。

当前构建输出为 `.phase-a-build/`，保留 `dist/` 全部现有文件和现有 Pages 发布流程。Vite 的 `base` 为 `/personal-nav/`。后续切换到发布目录需要另行明确指令。

`node_modules/` 和 `.phase-a-build/` 是本阶段新增的已知依赖、构建产物，加入忽略规则；保留此前 `.DS_Store`、`.tokenize` 及其他规则。

## Legacy 基线与复制

基线提交为 `4a309f5fc14457ec7a288b097f99c705b5f25288`，原 `dist/` 共 54 个文件。`data/legacy-hash-manifest.json` 记录相对于发布根目录的路径及 SHA-256；`index.html` 单独标记可替代，排除在 53 个不变资源之外。

已确认根目录对应的 53 个源文件与原 `dist/` 逐字节一致，再仅通过复制创建 `public/` 中的副本；原文件及 `nav.html` 保留。哈希清单不随 build 自动更新，校验还会对照基线 Git 对象，避免把修改后的资源误记为基线。因此运行校验需要本仓库包含上述基线提交的 Git 历史。

旧 `cli-course.html` 第 486、1515 行及 `python-course/29_大师之路_毕业设计_个人自动化助手.html` 第 384 行已有行尾空格。为保留原始哈希，`.gitattributes` 仅对这两个 `public/` 副本关闭行尾空格检查，不修改内容；其他空白检查及全部哈希检查仍执行。

## 本地命令

- `npm ci`：按锁文件安装依赖。
- `npm run dev`：启动本地开发服务。
- `npm run build`：TypeScript 检查、构建、自动执行 legacy 校验。
- `npm run verify:legacy`：检查根目录、`public/`、原 `dist/` 和 `.phase-a-build/` 各自的 53 个文件、哈希及 CLI 存储 key；须先构建。
- `npm test`：在临时副本中验证缺文件、哈希变化、CLI key 变化、错误引用会失败，以及替代首页不影响 legacy 校验。
- `npm run preview`：本地预览，不部署。

资源引用校验读取原 `data/links.v1.json` 的 23 条资源：10 个站内引用检查落地文件，13 个外部 URL 检查 HTTP(S) URL 可解析性，不请求远端、不声称外站可用。构建入口另外检查 `/personal-nav/` 下脚本路径及文件存在。

## 已知缺陷（仅登记）

`timeline/france/` 和 `timeline/renaissance/` 各自的 `style-a.html`、`style-b.html`、`style-c.html` 引用了不存在的同目录 `00-风格选择.html`（每页两处，共 12 处）。这是迁移前缺陷，不是 `links.v1.json` 的入口缺失；本阶段不创建目标文件、不修改引用。哈希保护保留原样。

本阶段不 push、不部署、不修改 GitHub Pages 设置或 workflows；独立提交后停止，等待 Phase B 明确授权。
