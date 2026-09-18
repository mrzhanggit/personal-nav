# Phase C4 — Continue / Focus Queue

基于 f8a92cb64230a1ccd87be99be679c3d4fd0eacbf，分支 redesign/personal-os-v1，开始时工作区干净。仅实现用户主动选择的最多 3 项 Focus Queue。用户已确认 C4 人工验收通过，并授权本阶段收尾与独立 Git 提交；不 push、不部署、不进入下一阶段。

## 数据与状态

- src/lib/continue.ts 为统一领域层，ContinueProvider 在视图外共享实例，通过 useSyncExternalStore 同步 Home、Space、Favorites。
- localStorage key：zcb-os:continue-resources。仅存 resourceId、addedAt、lastContinuedAt；未继续过为 null，不保存完整资源或虚构进度。
- 真实资源由 links.v1.json 解析。读取过滤无效/已消失 ID、非法时间，排序去重后限制 3 项并剥离额外字段。缺失/损坏数据为空，存储访问或写入失败时保持内存功能。
- addToContinue 明确返回 added/exists/full/invalid；第 4 项拒绝，不替换、不写入。按 lastContinuedAt ?? addedAt 降序；touch 不更改 addedAt。

## 界面与关系

- Space/Favorites 复用 ResourceItem detailed，增加低权重时钟图标和小字号加入/移除操作，aria-label 包含完整资源名称，aria-pressed 表示状态。
- 拒绝加入时反馈显示在当前卡片内的 aria-live status；释放容量后提示消失。无全局 toast、新依赖或 Palette 扩展。
- 首页替换原 ActivitySection，保留原诚实空状态。卡片显示真实图标、名称、描述或 Space，提供继续主按钮与低权重移除。桌面最多三列，手机单列。移除后焦点回 Continue 标题。
- continueResource 通过 useOpenResource 复用原 openResource，继续时更新 lastContinuedAt 和 Recent。保留原单资源调用语义，包括其现有 popup 行为；未套用 Workspace 批量 success 判断。
- Favorites、Recent 和 Workspace 领域实现均未修改。加入/移除不写 Recent、不收藏、不改 Workspace；取消收藏不移除 Continue；Workspace 启动不加入 Continue。
- 无自定义资源、进度、Todo、任务、提醒、编辑、拖拽、Apps/Projects 完整页面、AI、云同步或路由功能。

## 验证

- 自动测试 52/52（原 41 + 11）：首次/重复/移除、三项上限、拒绝第四项、刷新排序/touch、失效/损坏/超限数据、存储异常、订阅、Favorites/Recent/Workspace 隔离、继续打开更新 Recent、23 个真实引用。
- Ego Chromium：键盘 Enter 加入、前三项成功、第四项卡内提示且原列表/Recent/Favorites 不变；Favorites 同步移除再加入，刷新恢复。
- 首页键盘继续 Claude Code 后打开正确内部课程地址，lastContinuedAt 更新并置顶，Recent 次数从 1 到 2，Favorites 不变。键盘 Space 移除后焦点回 continue-heading。
- 1680/1440/1024/390px 首页截图和 DOM 检查，网格 3/3/3/1 列，无横向溢出。桌面与手机另验证 Space 卡片内按钮及上限提示完整包含，无越界。
- build、独立 legacy verification、全部 tests、git diff --check 通过；根目录、public、dist、隔离构建各 53/53 legacy 保护通过。
- public legacy、dist、GitHub Actions、部署配置、旧课程和 cli-course.save.v1 未修改。

预览：http://127.0.0.1:5175/personal-nav/ 。在 Space 或 Favorites 加入资源，回首页体验 Continue。
