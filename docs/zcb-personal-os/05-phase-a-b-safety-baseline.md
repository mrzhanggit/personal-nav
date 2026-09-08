# Phase A/B 安全基线

本文件记录已确认的安全约束。任何执行均必须优先遵守本基线；本次仅提交规划与安全基线，不开始 Phase A 实现。

## 八条安全约束

1. Phase A 中旧静态资源先复制到 `public/`，不得提前移动、删除或覆盖根目录旧文件。

2. 当前 `dist/` 基线为 54 个文件。新版 `dist/index.html` 可以替代旧首页；其他 53 个 legacy 发布资源必须保持路径和内容一致。

3. `nav.html` 现阶段不得删除，作为旧首页源码和回滚参考保留。

4. `cli-course.html` 的旧 localStorage key `cli-course.save.v1` 不得修改、迁移或清理。新 Personal OS 的存储统一使用 `zcb-os:*` 命名空间。

5. 法国/文艺复兴页面中不存在的 `00-风格选择.html` 属于迁移前既有缺陷。本阶段只登记，不修复。

6. Phase A/B 不修改线上发布机制：不 push `main`，不 push `gh-pages`，不修改 GitHub Pages 设置，不切换现有部署链路。

7. 不根据视觉参考图虚构网址、App、阅读进度、项目进度或业务数据。

8. `.gitignore` 当前只新增 `.DS_Store`，不随意忽略其他未知文件。

## 后续校验与提交边界

Phase A 会生成 legacy hash manifest，并增加自动校验脚本，用于验证除首页外的 53 个 legacy 发布资源路径和内容保持一致。这些工作属于后续 Phase A，不属于本次规划基线提交。

本次不修改 `nav.html`、`links.json`、`dist/**`、`timeline/**`、`python-course/**`、`claude-code-course.html`、`cli-course.html`、`.github/workflows/**`、`.workbuddy/**` 或任何现有线上代码。
