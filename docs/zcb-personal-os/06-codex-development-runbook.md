# Codex 开发运行手册

- 当前开发工具：Codex。
- 当前分支：`redesign/personal-os-v1`。
- 开发原则：Plan → Implement → Build → Verify → Review → Commit。
- 每个 Phase 单独提交。

每次开始开发前必须完整阅读以下文件（相对于 `docs/zcb-personal-os/`）：

- `01-current-site-audit.md`
- `02-information-architecture.md`
- `03-prd-v1.md`
- `05-phase-a-b-safety-baseline.md`

任何执行均必须优先遵守安全基线。不允许未经明确指令自动进入下一 Phase，不允许 push `main` / `gh-pages`，不允许自行部署线上版本。

本次仅提交规划与安全基线，不开始 Phase A；legacy hash manifest 和自动校验脚本留待 Phase A 实施。
