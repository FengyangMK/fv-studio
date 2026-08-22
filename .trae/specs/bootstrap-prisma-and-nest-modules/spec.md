# apps/server Prisma 初始化与 Nest 模块化落地 Spec

## Why

当前 `apps/server` 已有架构约束文档和本地 PostgreSQL 容器，但代码仍停留在 NestJS 脚手架初始状态，尚未真正建立 Prisma 运行时基础设施、配置装配与模块化目录骨架。需要把这些基础能力落地成可运行、可扩展的后端基线，才能继续承载后续业务开发。

## What Changes

- 为 `apps/server` 引入 Prisma 初始化所需的依赖、目录、schema、客户端生成与迁移脚本约定
- 在 `apps/server` 中落地基于 `ConfigModule` 的配置装配、环境变量校验和 Prisma 基础设施模块
- 将当前脚手架式 `AppModule` 演进为模块化入口，拆出最小可运行的功能模块与共享基础设施
- 建立最小可验证的健康检查或基础接口，证明 Nest 模块化结构与 Prisma 初始化链路已接通

## Impact

- Affected specs: `server-runtime-bootstrap`, `prisma-initialization`, `nestjs-feature-modules`
- Affected code: `apps/server/package.json`, `apps/server/src/**`, `apps/server/prisma/**`, `apps/server/.env*`, `apps/server/test/**`

## ADDED Requirements

### Requirement: Prisma 初始化基线

系统 SHALL 在 `apps/server` 中建立可执行的 Prisma 初始化基线，使服务端能够通过统一配置连接本地 PostgreSQL，并生成 Prisma Client。

#### Scenario: 建立 Prisma 目录与 schema

- **WHEN** 开发者查看 `apps/server`
- **THEN** 应存在 Prisma CLI 使用的专属目录，例如 `apps/server/prisma`
- **AND** 该目录中应包含 `schema.prisma`
- **AND** `schema.prisma` 应配置 PostgreSQL provider 与来自 `DATABASE_URL` 的 datasource
- **AND** 应具备最小可用的数据模型，能够支撑首次迁移与客户端生成

#### Scenario: 建立 Prisma 运行时接入

- **WHEN** Nest 应用启动
- **THEN** 应通过独立的 `PrismaModule` / `PrismaService` 管理 Prisma Client 生命周期
- **AND** 其他功能模块通过模块依赖使用 Prisma，而不是在控制器内直接实例化客户端
- **AND** Prisma 初始化与连接串读取必须通过统一配置层完成

#### Scenario: 建立 Prisma 脚本约定

- **WHEN** 开发者查看 `apps/server/package.json`
- **THEN** 应存在 Prisma generate、migrate、studio 或等价脚本
- **AND** 脚本命名应与 monorepo 下 `@fv-studio/server` 的执行方式兼容

### Requirement: Nest 配置与基础设施初始化

系统 SHALL 将 `apps/server` 从脚手架式入口升级为具备配置校验、全局输入校验和基础错误处理的后端启动基线。

#### Scenario: 配置统一收口

- **WHEN** 应用读取端口、环境和数据库连接信息
- **THEN** 应通过 `ConfigModule` 或集中配置层统一获取
- **AND** 启动时应校验关键环境变量，例如 `DATABASE_URL`
- **AND** 业务代码中不得继续散落直接读取 `process.env`

#### Scenario: 建立全局应用基线

- **WHEN** 应用在 `main.ts` 中启动
- **THEN** 应启用全局 `ValidationPipe`
- **AND** 应配置统一的 API 前缀或保持明确约定
- **AND** 应为后续统一异常处理和日志收口保留清晰落点

### Requirement: Nest 模块化目录落地

系统 SHALL 按功能模块组织 `apps/server/src`，不再将业务逻辑留在根级 `AppController` / `AppService` 中。

#### Scenario: 建立根模块装配

- **WHEN** 开发者查看 `src/app.module.ts`
- **THEN** 根模块应只负责导入配置模块、Prisma 模块、共享模块与最小功能模块
- **AND** 根模块不得继续承载具体业务逻辑

#### Scenario: 建立最小功能模块

- **WHEN** 开发者运行服务并访问基础接口
- **THEN** 应存在至少一个独立功能模块，例如 `health` 或 `system`
- **AND** 该模块应包含 module、controller、service 和按需 DTO
- **AND** 该模块的存在应证明项目已从单文件脚手架切换为按功能组织

### Requirement: 基础验证链路

系统 SHALL 提供最小验证链路，证明 Prisma 初始化、配置装配和模块化入口可以协同工作。

#### Scenario: 本地开发验证

- **WHEN** 开发者执行安装后的基础命令
- **THEN** 至少应能完成类型检查、构建或等价静态验证
- **AND** Prisma 相关命令应能在本地脚本层被调用
- **AND** 基础接口应具备明确的成功响应约定

## MODIFIED Requirements

### Requirement: apps/server 启动骨架

`apps/server` 的启动方式从“仅包含 `AppController` / `AppService` 的 NestJS 初始模板”修改为“包含配置层、Prisma 基础设施、共享目录与最小功能模块的可扩展后端基线”。后续新功能必须在既有模块化结构中扩展，而不是继续向根控制器和根服务追加代码。

## REMOVED Requirements

### Requirement: 仅依赖初始 AppController 的占位服务

**Reason**: 初始脚手架结构无法承载 Prisma 初始化、配置校验和按功能模块扩展，继续沿用会放大后续重构成本。
**Migration**: 将根级占位逻辑迁移为最小功能模块；根模块仅保留装配职责，并通过 Prisma 与配置基础设施支撑后续业务能力。
