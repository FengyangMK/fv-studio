# User 模块 CRUD 与 Swagger 文档 Spec

## Why

当前 `apps/server` 已完成 NestJS、Prisma 和基础健康检查链路的搭建，但还没有第一个真实业务模块。需要落地一个 `User` 模块作为后端业务基线，同时把 Swagger 文档入口真正接通，方便后续接口开发、调试与联调。

## What Changes

- 在 `apps/server` 中新增按功能模块组织的 `User` 模块，提供用户信息的基础 CRUD 能力
- 在 Prisma schema 中新增 `User` 数据模型，并通过迁移同步到 PostgreSQL
- 为 `User` 模块补齐创建、更新、查询、删除所需的 DTO、参数校验和响应结构
- 接入 `@nestjs/swagger` 运行时文档配置，生成可访问的 Swagger 接口文档

## Impact

- Affected specs: `user-module`, `user-crud-api`, `swagger-api-docs`
- Affected code: `apps/server/package.json`, `apps/server/src/**`, `apps/server/prisma/**`, `apps/server/nest-cli.json`, `apps/server/.env*`

## ADDED Requirements

### Requirement: User 模块 CRUD 能力

系统 SHALL 在 `apps/server` 中提供一个按功能模块组织的 `User` 模块，支持用户信息的基础增删改查。

#### Scenario: 创建用户

- **WHEN** 客户端调用创建用户接口并提交合法用户信息
- **THEN** 系统应创建一条新的用户记录
- **AND** 响应中应返回规范化后的用户信息
- **AND** 若唯一字段冲突，应返回明确的业务错误而不是原始数据库异常

#### Scenario: 查询用户列表

- **WHEN** 客户端调用用户列表接口
- **THEN** 系统应返回用户列表
- **AND** 至少支持基础排序或稳定返回顺序
- **AND** 响应结构应适合 Swagger 展示与前端联调

#### Scenario: 查询单个用户

- **WHEN** 客户端根据用户标识查询详情
- **THEN** 系统应返回对应用户信息
- **AND** 当用户不存在时应返回明确的 404 错误

#### Scenario: 更新用户

- **WHEN** 客户端调用更新接口并提交部分或全部可更新字段
- **THEN** 系统应更新对应用户记录
- **AND** 不允许通过更新接口写入未声明字段

#### Scenario: 删除用户

- **WHEN** 客户端调用删除接口
- **THEN** 系统应删除对应用户记录或执行明确的删除语义
- **AND** 删除成功后应返回约定响应

### Requirement: Prisma User 数据模型

系统 SHALL 在 Prisma schema 中定义可支撑 `User` 模块 CRUD 的最小用户数据模型。

#### Scenario: 定义最小用户模型

- **WHEN** 开发者查看 `apps/server/prisma/schema.prisma`
- **THEN** 应存在 `User` 模型
- **AND** 模型至少包含主键、用户名或昵称、邮箱、创建时间、更新时间等基础字段
- **AND** 应为需要唯一约束的字段配置唯一索引

#### Scenario: 同步数据库结构

- **WHEN** 用户模型被加入 Prisma schema
- **THEN** 应生成对应迁移或等价数据库变更记录
- **AND** Prisma Client 应同步更新，以供 Nest 服务层使用

### Requirement: 输入校验与响应 DTO

系统 SHALL 为 `User` 模块的请求与响应建立清晰的 DTO 契约，并与全局校验链路配合。

#### Scenario: 校验输入

- **WHEN** 客户端提交创建、更新、查询参数
- **THEN** 接口应使用 DTO 与 `class-validator` 对输入进行校验
- **AND** 不合法输入应被全局 `ValidationPipe` 拦截

#### Scenario: 返回响应

- **WHEN** 控制器返回用户数据
- **THEN** 应返回显式定义的响应 DTO 或明确的响应结构
- **AND** 不应直接暴露 Prisma 原始对象中不必要的字段

### Requirement: Swagger 接口文档

系统 SHALL 在运行时启用 Swagger 文档入口，并为 `User` 模块 CRUD 接口生成可浏览的 API 文档。

#### Scenario: 配置 Swagger 文档入口

- **WHEN** 开发者启动 `apps/server`
- **THEN** 应能通过明确路由访问 Swagger UI
- **AND** 文档应包含服务基础信息，例如标题、描述或版本

#### Scenario: 展示 User 模块接口

- **WHEN** 开发者打开 Swagger 文档页面
- **THEN** 应能看到 `User` 模块的 CRUD 接口
- **AND** 接口请求体、参数与响应应具备基本文档描述

## MODIFIED Requirements

### Requirement: apps/server 最小功能模块基线

`apps/server` 的最小业务基线从“仅包含健康检查模块”扩展为“包含健康检查模块与首个真实业务模块 User”。后续业务开发应继续在 `src/modules/*` 下按功能模块扩展，而不是回退到根级控制器模式。

## REMOVED Requirements

### Requirement: 仅依赖 health 模块作为业务示例

**Reason**: 单一健康检查模块只能验证基础设施链路，无法证明 Prisma、DTO、控制器、服务与 Swagger 在真实业务场景中的协同工作。
**Migration**: 新增 `User` 模块作为第一个真实业务模块，同时保留 `health` 作为运行时探活接口。
