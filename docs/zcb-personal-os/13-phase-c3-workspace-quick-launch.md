# Phase C3 — Workspace Quick Launch

基于 `b83c3921f0d080739bbb7d186b6dbe38e5b3b65c`，分支 `redesign/personal-os-v1`，开始时工作区干净。仅实现 Workspace 快速启动。用户已确认 C3 人工验收通过，并授权本阶段收尾与独立 Git 提交；不 push、不部署、不进入下一阶段。

## 结构与真实数据

- AppView 新增 workspace，Sidebar 的“快速”进入 WorkspaceView；沿用现有 Shell、Provider、焦点与滚动处理。无 Router、URL 修改或刷新。
- 只读 workspaces.v1.json 的 links 字段，用真实 links.v1.json 按 ID 映射。保留配置顺序、去重，返回 invalidIds；自动测试报告无效 ID，UI 忽略并提示数量。
- 四组真实资源数：开始工作 0、开始学习 3、投资研究 3、AI 创作 2。空场景显示“尚未配置资源”且禁用启动；不使用 note 中未来计划的资源。
- 卡片完整预览真实图标、名称、描述、数量，用户检查后直接启动。不新增收藏控件或依赖。

## 批量打开与 Recent

- launchWorkspace 同步执行，不在用户点击与 window.open 之间 await。URL 使用原 resourceHref 与 BASE_URL，外部地址保持原样，浏览器适配层再检查 http/https URL。
- 同步申请 about:blank，返回 null 记 blocked。获得窗口后先设置 opener=null，再通过该窗口内 target=_self、rel="noopener noreferrer"、referrerPolicy="no-referrer" 的链接执行目标导航。
- 不直接用带 noopener 的 window.open 返回值判断拦截，因为该参数本身会使成功调用也返回 null。参考 [MDN window.open](https://developer.mozilla.org/en-US/docs/Web/API/Window/open)。
- success 指获得窗口并执行目标导航；blocked 指申请窗口返回 null；URL、窗口已关闭、导航或其他打开异常记 failed，并尽力关闭未使用空白窗口。单项失败不阻断后续资源。
- success 表示导航已发起，不承诺远程页面加载成功或 HTTP 可用性。跨域远端加载结果不在本阶段检测范围。
- 仅 success 调用 useRecordWorkspaceSuccess，通过原 store.openResource 的空导航回调记录一次。原 recent.ts、单资源 useOpenResource/ResourceAnchor 的语义及存储结构不变。记录异常不会将已执行的导航重新归类为失败。
- blocked/failed、浏览预览、无效 ID 和 Workspace 自身都不新增 Recent。Favorites 无任何写入。重复 ID 每次启动只打开/记录一次；再次点击启动是一次新的访问。
- 卡内 aria-live status 报告成功/总数、被阻止及失败数量；无资源也有明确反馈。浏览器仍可能只允许一个窗口，未绕过其限制。

## 验证

- 自动测试 41/41（原 31 + Workspace 10）：真实数据映射、空/无效/重复 ID、单/多资源、内外 URL、blocked/failed/success、异常继续、窗口清理、安全导航顺序、Recent 次数与格式、Favorites 隔离。
- Ego Chromium 真实点击学习 Workspace：1/3 成功、2 个被浏览器阻止；Recent 仅 word-memory，新窗口到达真实外部地址，opener=null、referrer 为空。
- 浏览器故障注入 window.open（验后恢复）：学习场景 1 success/1 blocked/1 failed，仅 claude-code-course 新增 Recent，内部地址为 /personal-nav/claude-code-course.html；Favorites 保持原值。手机键盘 Enter 启动全部 blocked 时 Recent 不变。
- 实际切换 Home → Favorites → Workspace → Home → Space → Workspace：URL 不变，active 正确，焦点回 main。
- 1680/1440/1024/390px 均查看截图与 DOM：网格 2/2/2/1 列、无横向溢出、启动按钮高 44px；手机底部卡片及反馈可滚动显示，无文字溢出。
- npm run build、独立 npm run verify:legacy、npm test、git diff --check 通过。根目录、public、dist、.phase-a-build 各 53/53 legacy 保护通过。
- public legacy、dist、GitHub Actions、部署配置、旧课程和 cli-course.save.v1 未修改。未实现 Continue、Workspace 编辑、新建、删除、排序、自定义、AI、云同步、Apps/Projects 完整页或后续阶段。

预览：<http://127.0.0.1:5175/personal-nav/>，点击 Sidebar“快速”。
