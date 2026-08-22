# apps/server 清理测试残留与代码整理 Spec

## Why

当前 `apps/server` 已完成 Prisma 与 Nest 模块化基础搭建，但仍保留了一些仅用于启动验证或测试阶段的占位内容，例如无实际运行价值的测试脚本占位和未被业务使用的示例模型。这些内容会稀释代码语义，也会让后续真实业务开发难以区分基础设施代码与临时验证代码，因此需要进行一次面向纯净性的清理与整理。

## What Changes

- 移除 `apps/server` 中测试阶段遗留的占位业务代码、示例模型和无效测试脚本
- 保留真正服务运行所需的基础设施代码，如配置层、Prisma 基础设施和健康检查模块
- 整理现有 `apps/server` 代码的结构与命名可读性，在不改变既有运行行为的前提下提高可维护性
- 为关键代码文件补充简要注释，说明模块职责、配置来源或关键执行意图

## Impact

- Affected specs: `server-code-cleanup`, `server-bootstrap-purity`, `server-code-readability`
- Affected code: `apps/server/package.json`, `apps/server/src/**`, `apps/server/prisma/**`, `apps/server/AGENT.md`

## ADDED Requirements

### Requirement: 清理测试与占位业务代码

系统 SHALL 从 `apps/server` 中移除仅为测试、演示或启动验证临时引入且当前未被真实运行链路使用的业务代码与脚本占位。

#### Scenario: 移除无效测试脚本占位

- **WHEN** 开发者查看 `apps/server/package.json`
- **THEN** 不应再保留仅输出“tests are temporarily disabled”之类信息的占位测试脚本
- **AND** 不应继续在格式化或 lint 脚本中引用不存在或未启用的 `test` 目录作为默认目标

#### Scenario: 移除未使用的示例业务模型

- **WHEN** 开发者查看 `apps/server/prisma/schema.prisma` 与相关迁移
- **THEN** 不应保留仅为初始化验证而创建、但未被当前服务真实业务使用的示例业务模型
- **AND** 若存在此类模型，对应迁移与引用也应同步清理或调整
- **AND** 清理后不得破坏服务当前最小可运行链路

### Requirement: 保持服务基础链路纯净

系统 SHALL 在清理占位内容后保留真正必要的运行时代码，使 `apps/server` 仍然具备清晰、最小且可验证的服务端基础能力。

#### Scenario: 保留必要基础设施

- **WHEN** 清理完成后查看服务端代码
- **THEN** `ConfigModule`、`PrismaModule`、`PrismaService` 与最小功能模块应继续存在
- **AND** 健康检查链路应继续能够反映应用与数据库连通状态
- **AND** 不应因为清理测试残留而删掉后续业务开发仍需要的基础设施

### Requirement: 整理现有 server 代码

系统 SHALL 对已有 `apps/server` 代码做轻量整理，在不引入额外业务复杂度的前提下提升结构清晰度与可读性。

#### Scenario: 整理文件与职责表达

- **WHEN** 开发者查看 `src/config`、`src/prisma`、`src/modules/health` 与启动入口
- **THEN** 文件内容应围绕单一职责组织
- **AND** 导入顺序、命名与返回结构应保持一致性
- **AND** 不应为了“整理”而引入新的业务模块或无关抽象

### Requirement: 为关键代码补充简要注释

系统 SHALL 为 `apps/server` 中关键但不完全自解释的代码位置补充简洁注释，帮助后续开发者快速理解职责与约束。

#### Scenario: 补充必要注释

- **WHEN** 开发者阅读启动入口、配置层、Prisma 基础设施或健康检查模块
- **THEN** 应能看到简要注释说明关键职责，例如配置来源、连接用途、健康检查意图或生命周期行为
- **AND** 注释应保持简洁，避免逐行翻译代码或加入噪音性描述

## MODIFIED Requirements

### Requirement: apps/server 基线内容

`apps/server` 的基础代码要求从“只要能完成启动验证即可保留相关占位代码”调整为“基础设施代码必须服务于真实运行链路，测试或演示阶段的占位业务代码应及时移除，仅保留当前运行必需内容”。

## REMOVED Requirements

### Requirement: 允许保留测试阶段占位业务实现

**Reason**: 占位业务模型与无效测试脚本会污染代码语义，降低后续真实业务开发时的判断成本与代码纯净度。
**Migration**: 删除未使用的测试/演示代码与脚本；对保留的基础设施代码进行轻量整理，并用简要注释说明职责。
