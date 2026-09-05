# FV Studio 项目开发规范

本文档是项目根目录级别的通用开发规范，适用于 `apps/*`、`packages/*` 以及根目录工程配置。

## 1. 规范优先级

开始开发、审查或重构某个子包前，必须先检查目标目录及其父级目录中的 `AGENTS.md`。

规范优先级从高到低如下：

1. 用户当前明确提出的要求
2. 目标子包目录下最近的 `AGENTS.md`
3. 更上层目录的 `AGENTS.md`
4. 本文件

子包规范可以补充或覆盖本文件的通用约定。若不同层级规范发生冲突，以距离目标文件最近的规范为准；无法判断时应暂停并说明冲突。

当前已存在的子包规范：

- `apps/server/AGENTS.md`：NestJS 后端架构、配置、DTO、异常、日志、测试和 Prisma 约束

## 2. 技术栈基线

除非用户明确要求或经过评审，不得随意替换以下基础设施：

- 语言：TypeScript
- 包管理：pnpm，沿用 workspace 配置
- Monorepo 编排：Turborepo
- 后端：NestJS
- 数据库：PostgreSQL
- ORM：Prisma
- Web/Admin 前端：Vue 3、Composition API、`<script setup>`、TypeScript
- 前端构建：Vite
- 样式：优先使用现有设计系统和组件包；新增样式应保持局部、可维护
- 校验：ESLint、Prettier、TypeScript typecheck
- 数据库本地运行：`docker/docker-compose.yml` 中的 PostgreSQL 服务

依赖版本必须优先遵循根目录 `package.json` 和 `pnpm-lock.yaml`。新增依赖前应确认是否已有 workspace 包可以复用，避免重复引入。

## 3. Monorepo 目录约定

```text
apps/
  server/       # 后端应用
  web/          # 面向用户的 Web 应用
  admin/        # 管理端应用
packages/
  ui/           # 可复用 UI 组件和设计基础设施
  utils/        # 与业务无关的通用工具
  agent/        # Agent 相关能力
docker/         # 本地基础设施配置，不存放运行时数据
```

约束如下：

- `apps/*` 放可独立运行的应用，不直接复制其他应用的业务代码。
- `packages/*` 放跨应用复用的能力，必须保持清晰、低耦合的公共 API。
- 具有明确业务语义的代码应留在对应应用或 feature module 中，不要随意塞入 `utils`。
- 应用之间通过 workspace 包或明确的 API 边界协作，禁止深层引用其他应用内部文件。
- 每个正在开发的子包应拥有自己的 `package.json`，并配置准确的 `name`、脚本和入口。

## 4. 通用代码规范

### TypeScript

- 默认使用 TypeScript，不新增未经必要性说明的 JavaScript 文件。
- 保持严格类型，避免 `any`；确需使用时必须限定范围并说明原因。
- 优先使用明确的类型、接口和联合类型表达业务约束。
- 对外导出的函数、类、组件、DTO 和公共类型应提供稳定、可读的类型定义。
- 不要为了绕过类型错误使用 `as any`、`@ts-ignore` 或关闭编译检查。

### 命名与文件

- 文件名使用小写 kebab-case 或项目现有约定；Vue 组件使用 PascalCase 文件名时保持全项目一致。
- 类、组件和 DTO 使用 PascalCase；函数、变量和 composable 使用 camelCase。
- 常量使用有语义的 camelCase 或 UPPER_SNAKE_CASE，遵循所在模块现有风格。
- 一个文件只承担清晰的单一职责，避免大型“万能”模块。

### 导入与格式化

- 使用项目已有 ESLint 和 Prettier 配置，不手工引入互相冲突的格式规则。
- 保持导入分组和排序一致，优先使用项目配置自动修复。
- 不提交调试输出、临时文件、构建产物、密钥或本地环境文件。
- 注释解释“为什么”，不要重复描述显而易见的代码。

## 5. 按子包开发的约定

开发任何功能时，先确定目标子包和边界，再修改对应目录：

1. 阅读根目录 `AGENTS.md`。
2. 从目标目录向上查找最近的 `AGENTS.md`，并完整阅读。
3. 检查目标子包的 `package.json`、入口文件、现有测试和脚本。
4. 优先复用该子包已有的依赖、工具和抽象。
5. 将代码、测试和配置放入对应子包，不把子包实现泄漏到根目录。
6. 完成后运行该子包的 typecheck、lint、build 和相关测试。

新增子包或形成稳定业务边界后，应补充该子包自己的 `AGENTS.md`，记录仅对该子包生效的架构约束、运行方式和验证要求。

## 6. 后端开发约定

`apps/server` 的详细规则以 [`apps/server/AGENTS.md`](apps/server/AGENTS.md) 为准。本文件只保留通用原则：

- 按功能模块组织代码，避免按技术类型在根目录平铺业务代码。
- Controller 只负责协议层，业务逻辑放在 service/use case。
- 外部输入必须通过 DTO 和校验管道。
- 数据库结构以 Prisma schema 和 migration 为唯一来源。
- 统一使用 NestJS Logger，不使用 `console.log`。
- 跨模块调用通过模块公开的 provider 完成，避免深层导入和循环依赖。
- Swagger/OpenAPI 的接口分组、摘要、描述、响应说明和 DTO 字段说明必须使用中文；代码标识符、路由路径和协议字段名保持项目既有命名。
- 服务端接口成功响应统一使用 `{ code: 0, message: string, data: T }`，异常响应统一使用 `{ code: number, message: string, data: null }`；除 HTTP 204 外不得返回不一致的顶层结构。

## 7. 前端开发约定

开发 `apps/web`、`apps/admin` 或前端公共包时：

- 优先使用 Vue 3 Composition API 和 `<script setup>`。
- 组件保持单一职责，页面编排与可复用业务逻辑分离。
- 可复用状态优先放入 composable 或明确的状态模块，不在组件间复制逻辑。
- Props、Emits、Slots 和异步状态必须有明确类型。
- 路由、状态管理、请求层和 UI 组件应按职责分层，避免页面组件直接堆积基础设施代码。
- 涉及可访问性、响应式布局或视觉改版时，遵循项目现有设计规范并进行实际页面检查。

## 8. 测试与验证

修改完成后，至少根据改动范围执行：

```bash
pnpm lint
pnpm --filter <package-name> typecheck
pnpm --filter <package-name> build
```

涉及后端或数据库时，追加：

```bash
pnpm --filter @fv-studio/server prisma:format
pnpm --filter @fv-studio/server exec prisma validate
pnpm --filter @fv-studio/server prisma:generate
```

新增业务能力必须同步补充可执行测试。不得长期保留只会输出错误并退出的占位测试脚本。

如果因依赖、网络、数据库或权限导致验证无法完成，应明确记录：执行的命令、实际错误、已完成的替代检查以及剩余风险。

## 9. 配置与敏感信息

- 本地配置使用 `.env` 文件，禁止将真实密钥、密码、Token 或完整数据库连接串提交到 Git。
- 配置读取集中在配置层；业务模块不要散落读取 `process.env`。
- Docker 运行时数据、构建产物、缓存和临时目录不得纳入版本控制。
- 修改 Docker、Prisma migration 或 workspace 配置时，应检查是否会影响其他子包。

## 10. 变更交付要求

提交或交付前应确认：

- 变更只涉及用户要求的范围。
- 没有误删其他子包的现有实现。
- 没有提交 `node_modules`、数据库运行文件、构建产物或本地密钥。
- Git diff 能清楚解释每个文件的修改原因。
- 验证结果和未解决的问题已在交付说明中写明。
