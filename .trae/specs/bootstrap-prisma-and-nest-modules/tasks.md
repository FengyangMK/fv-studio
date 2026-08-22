# Tasks

- [x] Task 1: 为 `apps/server` 建立 Prisma 初始化基线。
    - [x] SubTask 1.1: 引入 Prisma 与 PostgreSQL 相关依赖，并补齐 `package.json` 中的 generate、migrate、studio 等脚本
    - [x] SubTask 1.2: 创建 `apps/server/prisma/schema.prisma` 与最小可迁移的数据模型，配置 `DATABASE_URL`
    - [x] SubTask 1.3: 建立 Prisma Client 生成约定，并准备首次迁移所需的目录结构

- [x] Task 2: 落地 Nest 的配置层与 Prisma 运行时基础设施。
    - [x] SubTask 2.1: 建立 `ConfigModule` 配置装配与关键环境变量校验
    - [x] SubTask 2.2: 创建 `src/prisma/prisma.module.ts` 与 `src/prisma/prisma.service.ts`，统一管理 Prisma Client 生命周期
    - [x] SubTask 2.3: 在启动入口接入全局 `ValidationPipe` 与最小应用级初始化约定

- [x] Task 3: 将 `apps/server` 从脚手架骨架迁移为按功能模块组织的 Nest 应用。
    - [x] SubTask 3.1: 调整 `AppModule`，仅保留模块装配职责
    - [x] SubTask 3.2: 新建最小功能模块（如 `health` 或 `system`），包含 module、controller、service 与按需 DTO
    - [x] SubTask 3.3: 清理或迁移原有 `AppController` / `AppService` 占位逻辑，避免继续作为业务承载点

- [x] Task 4: 验证 Prisma 初始化与 Nest 模块化基线可用。
    - [x] SubTask 4.1: 验证 Prisma 脚本、schema 与数据库连接约定一致
    - [x] SubTask 4.2: 验证服务端构建或类型检查通过
    - [x] SubTask 4.3: 验证最小功能模块的接口响应与模块装配符合规格

# Task Dependencies

- [Task 2] depends on [Task 1]
- [Task 3] depends on [Task 2]
- [Task 4] depends on [Task 1] and [Task 2] and [Task 3]
