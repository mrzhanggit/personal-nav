# ZCB Personal OS Planning Pack

本规划包位于当前仓库的 `docs/zcb-personal-os/`，根据 `personal-nav.zip` 源码审计生成。当前项目使用 Codex 开发，执行前必须优先遵守安全基线。

## 文件

以下路径均相对于 `docs/zcb-personal-os/`：

- `README.md`：规划包索引与使用说明
- `01-current-site-audit.md`：旧站审计与迁移结论
- `02-information-architecture.md`：新版信息架构
- `03-prd-v1.md`：完整产品与开发需求
- `04-claude-code-start-prompt.md`：早期 Claude Code 开发提示词，仅作历史参考
- `05-phase-a-b-safety-baseline.md`：Phase A/B 安全约束与后续校验要求
- `06-codex-development-runbook.md`：Codex 开发流程与阶段边界
- `data/legacy-links.original.json`：原始 links.json 备份
- `data/links.v1.json`：23 个旧条目的新版 schema 草稿
- `data/spaces.v1.json`：六大 Space 配置
- `data/workspaces.v1.json`：四组 Workspace 草稿
- `reference/visual-v2.png`：已确定的 V2 视觉母版，用于视觉设计参考，不是网页背景素材

## 推荐用法

按 `06-codex-development-runbook.md` 阅读必读文档，以 `data/` 中的文件作为迁移参考。任何执行均必须优先遵守 `05-phase-a-b-safety-baseline.md`；旧提示词不构成开始实施的授权。本次仅建立规划与安全基线，不开始 Phase A。
