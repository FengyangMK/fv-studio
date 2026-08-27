# `apps/server` 架构约束

本文档是 `apps/server` 的后端实现约束。当前目录仍是 NestJS 初始骨架，后续开发必须以本文档为准逐步演进，避免继续把业务能力堆在 `AppModule`、`AppController`、`AppService` 中。

## 1. 技术栈基线

`apps/server` 固定采用以下基线，除非经过明确评审，不得替换：

- Web 框架：NestJS
- 数据库：PostgreSQL
- ORM / 数据访问：Prisma
- 语言：TypeScript
- 包管理与脚本：沿用 monorepo 的 `pnpm` 与 workspace 约定

本地开发默认数据库连接信息与 `docker/docker-compose.yml` 保持一致：

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/fv_studio?schema=public"
```

容器内或同一 Docker 网络内访问数据库时，主机名使用 `postgres`：

```env
DATABASE_URL="postgresql://postgres:postgres@postgres:5432/fv_studio?schema=public"
```

## 2. 目录组织

`apps/server` 必须按功能模块组织，禁止按 controller、service、dto 等技术层在 `src` 根目录平铺业务代码。

推荐结构如下：

```text
apps/server/
  prisma/
    schema.prisma
    migrations/
    seed.ts                # 可选
  src/
    main.ts
    app.module.ts
    config/
      configuration.ts
      env.validation.ts
      env.types.ts
    prisma/
      prisma.module.ts
      prisma.service.ts
    shared/
      filters/
      interceptors/
      pipes/
      guards/
      decorators/
      logger/
      types/
      constants/
    modules/
      health/
        health.module.ts
        health.controller.ts
        health.service.ts
        dto/
      users/
        users.module.ts
        users.controller.ts
        users.service.ts
        dto/
        repositories/
```

约束如下：

- `src/app.module.ts` 只做模块装配，不承载具体业务逻辑。
- 业务代码统一放在 `src/modules/<feature>` 下；一个目录代表一个清晰的业务边界。
- `src/config` 放应用配置定义、环境变量校验和类型化配置读取。
- `src/prisma` 只放 NestJS 运行时需要的 Prisma 基础设施，例如 `PrismaService`、事务封装和 Prisma 模块。
- `apps/server/prisma` 是 Prisma CLI 专属目录，放 `schema.prisma`、迁移文件和种子脚本；不要和 `src/prisma` 混用。
- `src/shared` 仅放跨模块复用且不承载具体业务语义的基础设施。若代码未来需要被多个应用共享，应优先下沉到 monorepo 的 `packages/*`，不要从 `apps/server` 直接被其他 app 深层引用。

## 3. 模块边界

每个功能模块至少包含：

- `*.module.ts`：定义模块依赖、导出 provider
- `*.controller.ts`：HTTP 入口，只负责协议层
- `*.service.ts`：用例编排与业务规则
- `dto/`：请求与响应 DTO、分页参数、查询条件

按需增加：

- `repositories/`：当 Prisma 查询复杂、需要聚合多个查询或事务边界时使用
- `entities/` 或 `models/`：仅在确实需要表达领域对象时使用
- `events/`、`listeners/`：跨模块解耦时使用

边界约束：

- Controller 不得直接访问 Prisma，也不得写业务规则。
- Service 不得直接读取 `process.env`，只能依赖配置层。
- 跨模块调用必须通过模块导出的 provider 完成，禁止深层导入其他模块内部文件。
- 避免循环依赖；如果出现，优先重构模块边界，而不是滥用 `forwardRef`。
- `shared` 不得演化为“杂物层”。带明显业务语义的能力必须留在对应 feature module。

## 4. 配置管理

- 统一使用 NestJS `ConfigModule` 作为配置入口，并在 `AppModule` 中一次性加载。
- 环境变量必须在启动阶段完成校验；禁止让缺失或非法配置在运行时才暴露。
- 业务代码不得直接散落使用 `process.env.xxx`。允许直接读取环境变量的范围仅限配置装配层，例如 `src/config/*` 与启动入口的最小装配代码。
- 配置对象应按领域拆分，例如 `app`、`database`、`auth`，并提供类型安全访问方式。
- 数据库连接串统一命名为 `DATABASE_URL`，Prisma 与应用共用同一来源。

## 5. DTO 与参数校验

- 所有外部输入必须通过 DTO 定义，并结合 `class-validator`、`class-transformer` 或同等级方案进行校验与转换。
- `main.ts` 必须启用全局 `ValidationPipe`，至少包含：
    - `transform: true`
    - `whitelist: true`
    - `forbidNonWhitelisted: true`
- Controller 方法参数不得直接使用裸对象类型承接请求体或查询参数。
- DTO 只表达接口层契约，不直接复用 Prisma 生成类型作为入参 DTO。

## 6. 异常处理

- 业务代码禁止直接抛出无语义的 `Error`；应抛出明确的 NestJS HTTP 异常或受控的领域异常。
- 全局异常处理统一放在 `src/shared/filters`，至少负责：
    - 统一响应结构
    - 记录错误上下文
    - 将 Prisma 常见异常映射为可读的 HTTP 错误
- Controller 不做 `try/catch` 样板处理；异常由 service 抛出、由全局过滤器统一收口。

## 7. 日志规范

- 统一使用 NestJS `Logger` 或封装后的统一日志服务，禁止在业务代码中使用 `console.log`。
- 日志至少要带模块上下文，便于定位来源。
- 错误日志必须包含请求上下文或关键业务标识，但不得打印密码、令牌、数据库完整连接串等敏感信息。
- 启动日志、数据库连接日志和关键业务失败日志必须可检索。

## 8. 测试要求

当前 `apps/server/package.json` 中测试脚本仍是占位状态。后续一旦引入真实业务模块，必须同步恢复可执行测试，不得长期保留“测试禁用”状态。

约束如下：

- 单元测试优先覆盖 service、repository、关键 pipe / filter。
- E2E 测试放在 `apps/server/test` 或 NestJS 标准 e2e 目录，使用 Supertest 覆盖核心 HTTP 流程。
- 涉及 Prisma 的测试不得依赖开发库脏数据；应使用独立测试库、事务回滚或明确的 fixture 初始化策略。
- 新增业务接口时，至少补充对应的单元测试或 E2E 测试之一；涉及鉴权、事务、复杂查询时，两者都应补。

## 9. Prisma 规范

- `apps/server/prisma/schema.prisma` 是数据库结构的唯一源头；表结构变更必须先改 schema，再生成迁移。
- 所有 schema 变更必须通过 Prisma migration 管理，禁止只在本地数据库手动执行 DDL 而不落库到迁移文件。
- 每次修改 `schema.prisma` 后必须执行客户端生成，确保 `@prisma/client` 与 schema 保持一致。
- 推荐命令：

```bash
pnpm --filter @fv-studio/server exec prisma migrate dev --name <change-name>
pnpm --filter @fv-studio/server exec prisma generate
```

- `PrismaService` 作为数据库访问入口由 `src/prisma` 提供，并由需要的 feature module 通过模块依赖使用。
- 当一个用例包含多步写操作时，必须明确评估事务边界；需要原子性时使用 Prisma transaction。
- 避免把 Prisma 查询语句散落到多个 controller / service 中。复杂查询统一收敛到 repository 或 service 内的单一职责方法。

## 10. 与当前骨架的演进约束

当前 `src` 下仅有 `app.module.ts`、`app.controller.ts`、`app.service.ts` 与 `main.ts`，这只适用于脚手架阶段。后续演进时：

- 保留 `AppModule` 作为根模块，但真实业务能力必须迁移到 `src/modules/*`。
- 根路由若只用于健康检查，可保留为 `health` 能力；否则不要继续在 `AppController` 上叠加业务接口。
- 引入 Prisma 后，应优先完成 `src/config`、`src/prisma`、全局校验和异常收口，再继续扩展业务模块。

本文件对 `apps/server` 后续开发具备约束力。新增模块、数据库接入和工程初始化实现时，均应先满足本文档，再写业务代码。

## 11. 代码规范

代码编写必须符合 NestJS 规范，代码模块必须有说明，包括模块职责、依赖关系、服务提供等注释说明。函数参数、返回值、异常等也必须有注释说明。符合jsdoc规范。

```
/**
 * 获取用户信息
 * @param userId 用户ID
 * @returns 用户信息
 */
```
