# apps/server 架构约束与本地 PostgreSQL 规范 Spec

## Why

当前 `apps/server` 仍处于 NestJS 初始骨架状态，缺少明确的后端架构约束文档，也没有可直接启动的本地 PostgreSQL 开发环境。需要先建立统一的服务端工程规范，再补齐基于 Docker 的本地数据库基线，避免后续多人协作时出现目录失控、配置分散和数据库环境不一致的问题。

## What Changes

- 新增 `apps/server/AGENT.md`，约束 `apps/server` 的 NestJS 技术架构、模块组织方式、配置管理、Prisma 使用方式和工程边界
- 新增 `docker/docker-compose.yml`，用于本地桥接 Docker 软件启动 PostgreSQL 服务
- 约束 PostgreSQL 数据目录绑定到仓库内 `docker/postgresql` 路径
- 约束本地数据库服务的端口、健康检查、环境变量命名和网络模式，确保能被 `apps/server` 与 Prisma 稳定接入

## Impact

- Affected specs: `server-architecture-governance`, `local-postgres-runtime`
- Affected code: `apps/server/AGENT.md`, `docker/docker-compose.yml`, `docker/postgresql/`

## ADDED Requirements

### Requirement: 服务端架构约束文档

系统 SHALL 在 `apps/server/AGENT.md` 中定义该应用的后端技术架构约束，用于指导后续 NestJS、PostgreSQL 与 Prisma 相关开发。

#### Scenario: 文档覆盖核心约束

- **WHEN** 开发者查看 `apps/server/AGENT.md`
- **THEN** 文档应明确说明 `apps/server` 采用 NestJS + PostgreSQL + Prisma
- **AND** 文档应明确要求按功能模块组织代码，而非按 controller、service、dto 等技术层平铺
- **AND** 文档应说明配置统一通过 NestJS `ConfigModule` 或集中配置层管理，禁止业务代码直接散落读取环境变量
- **AND** 文档应说明 Prisma schema、迁移、客户端生成和数据库访问代码的推荐放置位置与使用边界
- **AND** 文档应说明控制器、服务、DTO、异常处理、校验、日志、测试的基本约束

#### Scenario: 文档约束模块边界

- **WHEN** 开发者新增业务能力
- **THEN** 必须先创建或扩展对应功能模块
- **AND** 不得在 `AppModule` 中直接堆叠全部业务逻辑
- **AND** 跨模块复用必须通过模块导出能力或共享基础设施层完成

### Requirement: 本地 PostgreSQL 容器编排

系统 SHALL 在 `docker/docker-compose.yml` 中提供可直接启动的 PostgreSQL 本地开发环境。

#### Scenario: 定义 PostgreSQL 服务

- **WHEN** 开发者查看 `docker/docker-compose.yml`
- **THEN** 文件应定义单一 PostgreSQL 服务
- **AND** 服务应使用 Docker bridge 网络运行
- **AND** 服务应暴露标准 PostgreSQL 端口供本机开发访问
- **AND** 服务应提供数据库名、用户名、密码等基础环境变量配置位

#### Scenario: 绑定数据库数据目录

- **WHEN** PostgreSQL 容器启动并写入数据
- **THEN** 数据文件必须持久化到仓库内 `docker/postgresql` 路径
- **AND** 该路径应作为宿主机绑定目录使用，而非匿名卷

#### Scenario: 支持服务端与 Prisma 接入

- **WHEN** 开发者需要让 `apps/server` 或 Prisma 连接本地数据库
- **THEN** `docker/docker-compose.yml` 应提供清晰的连接信息约定
- **AND** 连接约定应与 PostgreSQL 默认协议兼容
- **AND** 编排中应包含基础健康检查，便于后续服务等待数据库就绪

## MODIFIED Requirements

### Requirement: apps/server 初始化方式

`apps/server` 现有的 NestJS 初始骨架要求被扩展为可持续演进的模块化后端基线。后续新增能力必须遵守 `AGENT.md` 中定义的目录组织、配置管理、数据库访问与工程约束，而不是继续沿用仅适用于脚手架阶段的最小结构。

## REMOVED Requirements

### Requirement: 无后端工程约束的自由扩展

**Reason**: 缺少统一规范会导致模块边界混乱、环境配置分散，以及 Prisma 与数据库接入方式不一致。
**Migration**: 后续实现时，以 `apps/server/AGENT.md` 作为唯一的服务端架构约束入口；本地数据库统一通过 `docker/docker-compose.yml` 启动。
