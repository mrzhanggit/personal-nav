# Phase D0 — Navigation Data Baseline Correction

基于当前 HEAD 018a172，仅同步已确认的导航数据及修正 verifier 职责。用户已批准 D0 独立提交；不 push、不部署。C4 九个文件保持原样。

## 数据与保护边界

- root links.json 未修改；public/links.json 与 root 字节一致，均为 24 条当前兼容导航。
- links.v1.json 保留 23 个原 ID，新增 fengtang-zhengdao；learn / 文章档案 / learning-project / custom-domain / legacyCategory 文章库，均沿用现有字段语义。
- asset-dashboard 保留 ID 和分类，更新已确认的 URL、描述及 hostingType=custom-domain。
- 原 manifest、baseline commit、SHA-256 和 legacy-links.original.json 均不修改；历史快照严格校验为 Phase A 原始 23 条。
- dist 53/53 冻结；root/public/隔离构建其余 52 个静态文件路径和哈希严格保护，links.json 单独校验当前数据。隔离构建 JSON 必须与 public 字节一致。
- 当前数据数量以 root 为准，校验包含完整映射、必要字段、URL、唯一 ID/名称/URL、有效 Space、已有 kind/category/hostingType、root/public 字节及 root/V1 字段语义一致性。
- 以稳定 C3 Git 对象校验原有 23 个 ID 及其字段保留，仅允许确认的资产更新；新资源的核心字段有明确校验。未来新维护需显式调整当前数据契约，不修改历史 manifest。

## 验证

- npm run build 与独立 npm run verify:legacy 通过。
- D0/C3 六组测试 47/47 通过（原 41 + 数据边界测试 6）。
- 未改动的 C4 continue.test.mjs：10 通过、1 失败；唯一失败为第 51 行硬编码 23，而当前合法资源为 24。未隐藏、跳过或修改该断言。
- 完整 npm test：58 项，57 通过、1 个上述已知失败。该失败不是 Continue 功能异常；资源循环因前置数量断言中止，不能宣称这项覆盖已通过。
- git diff --check 通过。无 workspace 代码/测试、应用代码、根目录数据、dist、部署配置、GitHub Actions 或旧课程修改。

## C4 隔离审计

实施前后以下 SHA-256 完全一致（包括未提交的 package.json 和 continue.test.mjs）：

| 文件 | 实施前与实施后 SHA-256 |
|---|---|
| `package.json` | `b3729864b7acc8583f02b2ec8314193dc1eb8e5df9cde728e594944d082fbc53` |
| `src/App.tsx` | `37ad9fa9c8aa57f9f5e11005ef0eb13cf578a3e754a4a455264b10fcd38c6349` |
| `src/components/Home.tsx` | `d2ac8db6a9ceef699599f7f00e4975ae3618eca27041d7ecf0de68581259ed05` |
| `src/components/ResourceItem.tsx` | `edf2aab42edd35db0a5e22ab3d89a86c6ed8194155d854ee2d871eae55e01ac2` |
| `docs/zcb-personal-os/14-phase-c4-continue-focus-queue.md` | `cd51f675ac672691cf20166ab69614d4a21c18f2c5969d31b96f5cd44eb9a542` |
| `scripts/continue.test.mjs` | `dfac59aa04460b551d398cc6c4dbabfeca110213a4332e379182f3f192160f4d` |
| `src/components/Continue.tsx` | `a032ac676c7c24ced4b67bd76599657611d912715cdaca5128b4c9f85ae55e86` |
| `src/components/continue.css` | `961d3ea35ea6bc67bb25b05941281acd2f8f52df4e28f6944e6fac88a2a744ca` |
| `src/lib/continue.ts` | `0d0b07f1b63e9920f1557104634cc10e0f42e65832a18013049e04fb4edbedcd` |

## 提交前 current count 审查

已移除 verifier 与 D0 功能测试中固定当前总数为 24 的长期假设，日志动态显示数量。历史快照 23 为冻结事实；冯唐与资产更新保留明确迁移回归检查。新增纯测试 fixture 验证未来增加一条合法资源且 root/public/V1 同步时通过，缺失映射仍失败。C4 数量断言未修改。
