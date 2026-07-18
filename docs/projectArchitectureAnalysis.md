# FV Studio 项目架构分析报告

## 1. 项目定位

当前仓库是一个基于 `pnpm workspace + turbo` 的 monorepo 脚手架，已经具备统一的 TypeScript、ESLint、Prettier、Commitlint、Husky 与 Turbo 基础设施，但业务层仍处于早期初始化阶段。

现阶段的核心结论如下：

- 已有后端基础：`apps/server` 是唯一具备可运行源码的 NestJS 应用。
- 前端尚未落地：`apps/web`、`apps/admin` 目前仅保留包定义，没有 Vue3 源码与构建配置。
- 共享包尚未成型：`packages/core` 有一个示例源码文件，`packages/ui`、`packages/utils`、`packages/agent` 仍是占位包。
- 独立实验目录：`playground` 存在，但尚未被 `pnpm-workspace.yaml` 纳入工作区管理。

## 2. 当前完整目录结构

```text
fv-studio/
├─ .husky/
│  ├─ commit-msg
│  └─ pre-commit
├─ apps/
│  ├─ admin/
│  │  └─ package.json
│  ├─ server/
│  │  ├─ src/
│  │  │  ├─ app.controller.ts
│  │  │  ├─ app.module.ts
│  │  │  ├─ app.service.ts
│  │  │  └─ main.ts
│  │  ├─ nest-cli.json
│  │  ├─ package.json
│  │  └─ tsconfig.json
│  └─ web/
│     └─ package.json
├─ docs/
│  └─ projectArchitectureAnalysis.md
├─ packages/
│  ├─ agent/
│  │  └─ package.json
│  ├─ core/
│  │  ├─ src/
│  │  │  └─ index.ts
│  │  └─ package.json
│  ├─ ui/
│  │  └─ package.json
│  └─ utils/
│     └─ package.json
├─ playground/
│  └─ package.json
├─ .gitignore
├─ .prettierignore
├─ .prettierrc
├─ commitlint.config.mjs
├─ eslint.config.mjs
├─ package.json
├─ pnpm-lock.yaml
├─ pnpm-workspace.yaml
├─ tsconfig.client.json
├─ tsconfig.json
├─ tsconfig.server.json
└─ turbo.json
```

## 3. 顶层分层说明

### 3.1 根目录层

根目录负责 monorepo 的统一工程能力，不承载业务代码。

- `package.json`：定义根脚本、根开发依赖、lint-staged、commitizen 配置。
- `pnpm-workspace.yaml`：声明工作区范围，目前仅包含 `apps/*` 与 `packages/*`。
- `turbo.json`：统一编排 `build`、`lint`、`dev` 任务。
- `tsconfig.json`：项目通用 TypeScript 基线。
- `tsconfig.client.json`：前端类型系统基线。
- `tsconfig.server.json`：后端类型系统基线。
- `eslint.config.mjs`：统一 ESLint 规则，目前仅针对通用 JS/TS 和 `apps/server` 做了明确配置。
- `.prettierrc`：统一格式化风格。
- `.husky/*`、`commitlint.config.mjs`：统一提交前校验与提交信息规范。

### 3.2 `apps` 应用层

`apps` 用于承载可独立运行、可部署的应用。

- `apps/server`：NestJS 服务端应用，当前唯一有真实源码的业务入口。
- `apps/web`：面向终端用户的前端应用预留位，未来应承载 Vue3 Web 主应用。
- `apps/admin`：后台管理端应用预留位，未来应承载 Vue3 Admin 应用。

### 3.3 `packages` 公共包层

`packages` 用于承载跨应用复用的公共能力。

- `packages/core`：领域核心能力或跨端共享类型的候选位置，目前只有示例代码。
- `packages/ui`：前端共享组件库预留位。
- `packages/utils`：跨端工具函数预留位。
- `packages/agent`：智能体/流程能力预留位。

### 3.4 `playground` 实验层

`playground` 当前位于根目录同级，未纳入 workspace。它更适合被视作实验性、验证性或临时调试目录，不建议承载正式业务模块。

## 4. 当前层级关系与调用依赖

### 4.1 当前真实依赖关系

```text
root package.json
├─ 提供工程化工具链
├─ 管理 apps/* 与 packages/* 的任务编排
└─ 不直接承载业务逻辑

apps/server
├─ 使用 tsconfig.server.json 作为后端编译基线
├─ 使用 eslint.config.mjs 中 server 专属规则
└─ 当前仅依赖 NestJS 官方基础包

apps/web
└─ 当前仅为占位包，无实际依赖关系

apps/admin
└─ 当前仅为占位包，无实际依赖关系

packages/core
└─ 当前未被任何应用引用

packages/ui / packages/utils / packages/agent
└─ 当前均未被任何应用引用

playground
└─ 未纳入 workspace，也未被其他模块引用
```

### 4.2 当前后端内部调用关系

`apps/server/src` 内部是最小 Nest 模板结构：

```text
main.ts
└─ 启动 NestFactory.create(AppModule)

AppModule
├─ 注册 AppController
└─ 注册 AppService

AppController
└─ 调用 AppService.getHello()

AppService
└─ 返回字符串 "Hello World!"
```

### 4.3 当前依赖边界结论

- 根目录负责工程规则，不负责业务实现。
- `apps/server` 目前独立存在，尚未消费任何共享包。
- `apps/web`、`apps/admin` 尚未进入 Vue3 应用阶段。
- `packages/*` 还没有承担共享边界职责。
- 现状中不存在前后端统一 DTO、API 类型、共享常量或共享校验模型。

## 5. 现有代码包用途分析

### 5.1 应用包

#### `@fv-studio/server`

- 用途：后端服务入口。
- 技术栈：NestJS 11 + TypeScript。
- 当前职责：暴露最小 HTTP 服务，用于验证 NestJS 应用可启动。
- 现状评价：已形成应用壳，但还未形成模块化业务结构。

#### `@fv-studio/web`

- 用途：预留的前端主站包。
- 当前状态：只有 `package.json`，无 Vue3、Vite、路由、状态管理或构建脚本。
- 现状评价：未初始化。

#### `@fv-studio/admin`

- 用途：预留的管理后台包。
- 当前状态：只有 `package.json`，无 Vue3 管理端基础设施。
- 现状评价：未初始化。

#### `@fv-studio/playground`

- 用途：实验、原型、临时验证的候选目录。
- 当前状态：独立存在但未纳入 workspace。
- 风险：如果长期存放业务代码，会破坏 monorepo 边界。

### 5.2 公共包

#### `@fv-studio/core`

- 用途：理论上应承载跨端共享的核心领域模型、类型、协议常量、业务抽象。
- 当前状态：存在 `src/index.ts`，但内容仍是示例代码。
- 现状评价：目录已建立，但职责尚未真正落地。

#### `@fv-studio/ui`

- 用途：理论上应承载 Vue3 组件库、主题能力、设计系统。
- 当前状态：占位包。

#### `@fv-studio/utils`

- 用途：理论上应承载与业务无关、可跨端复用的工具函数。
- 当前状态：占位包。

#### `@fv-studio/agent`

- 用途：理论上应承载智能体编排、流程引擎、AI 调度能力。
- 当前状态：占位包。

## 6. npm 包依赖分析

### 6.1 根级工程化依赖

根级依赖主要服务于“统一开发流程”，不是业务运行依赖。

| 包名                               | 当前版本范围 | 锁定版本 | 作用                         |
| ---------------------------------- | ------------ | -------- | ---------------------------- |
| `typescript`                       | `^5.9.3`     | `5.9.3`  | 全仓库 TypeScript 编译基础   |
| `@types/node`                      | `^25.0.6`    | `25.2.3` | 根级 Node 类型支持           |
| `eslint`                           | `^9.39.2`    | `9.39.2` | 统一代码检查入口             |
| `@eslint/js`                       | `^9.39.2`    | `9.39.2` | ESLint 官方基础规则          |
| `typescript-eslint`                | `^8.52.0`    | `8.55.0` | TypeScript ESLint 解析与规则 |
| `globals`                          | `17.0.0`     | `17.0.0` | 预设全局变量集               |
| `prettier`                         | `^3.7.4`     | `3.8.1`  | 统一格式化                   |
| `eslint-plugin-prettier`           | `^5.5.4`     | `5.5.5`  | 将 Prettier 纳入 ESLint      |
| `eslint-plugin-simple-import-sort` | `^12.1.1`    | `12.1.1` | 统一 import 排序             |
| `commitizen`                       | `^4.3.1`     | `4.3.1`  | 交互式提交                   |
| `cz-git`                           | `^1.12.0`    | `1.12.0` | 提交消息生成与约束           |
| `commitlint`                       | `^20.3.1`    | `20.4.1` | 校验提交消息                 |
| `@commitlint/config-conventional`  | `^20.3.1`    | `20.4.1` | Conventional Commits 规则集  |
| `husky`                            | `^9.1.7`     | `9.1.7`  | Git Hook 管理                |
| `lint-staged`                      | `^16.2.7`    | `16.2.7` | 暂存区增量校验               |
| `turbo`                            | `^2.8.11`    | `2.8.11` | Monorepo 任务编排            |

### 6.2 服务端运行时依赖

| 包名                       | 当前版本范围 | 锁定版本  | 作用                                 |
| -------------------------- | ------------ | --------- | ------------------------------------ |
| `@nestjs/common`           | `^11.0.1`    | `11.1.14` | 控制器、服务、模块等基础装饰器与 API |
| `@nestjs/core`             | `^11.0.1`    | `11.1.14` | Nest 启动内核                        |
| `@nestjs/platform-express` | `^11.0.1`    | `11.1.14` | Express HTTP 平台适配器              |
| `reflect-metadata`         | `^0.2.2`     | `0.2.2`   | 装饰器元数据运行时支持               |
| `rxjs`                     | `^7.8.1`     | `7.8.2`   | Nest 响应式基础依赖                  |

### 6.3 服务端开发依赖

| 包名                 | 当前版本范围 | 锁定版本   | 作用                  |
| -------------------- | ------------ | ---------- | --------------------- |
| `@nestjs/cli`        | `^11.0.0`    | `11.0.16`  | `nest` CLI 构建与启动 |
| `@nestjs/schematics` | `^11.0.0`    | `11.0.9`   | Nest 代码生成模板     |
| `@types/express`     | `^5.0.0`     | `5.0.6`    | Express 类型声明      |
| `@types/node`        | `^22.10.7`   | `22.19.12` | 服务端 Node 类型声明  |
| `source-map-support` | `^0.5.21`    | `0.5.21`   | 调试堆栈映射支持      |
| `ts-loader`          | `^9.5.2`     | `9.5.4`    | TS 构建链相关能力     |
| `ts-node`            | `^10.9.2`    | `10.9.2`   | TypeScript 直接执行   |

### 6.4 当前依赖状态总结

- 真实业务依赖目前只存在于 `apps/server`。
- `apps/web`、`apps/admin` 与 `packages/*` 尚未声明 Vue3 或共享层依赖。
- 仓库还没有形成“前端依赖体系”和“共享包依赖体系”。
- 当前更准确地说是“后端雏形 + 前端预留位 + 公共包预留位”。

## 7. 版本兼容性与潜在风险

### 7.1 已经比较稳定的组合

- `TypeScript 5.9.x + typescript-eslint 8.55.x + ESLint 9.39.x` 组合基本稳定。
- `NestJS 11.1.x` 三件套版本一致，服务端核心依赖匹配良好。
- `Prettier 3.x + ESLint Plugin Prettier 5.x` 组合可正常工作。

### 7.2 当前存在的兼容性或治理风险

#### 风险一：Node 类型版本不统一

- 根目录使用 `@types/node@25.x`。
- `apps/server` 使用 `@types/node@22.x`。

风险表现：

- 当后续共享脚本、公共工具包、构建脚本开始跨层复用时，可能出现类型差异。
- 例如全局 API、Node 内置模块声明、实验特性类型签名可能不一致。

建议：

- 统一全仓库 Node 运行基线，优先固定到项目实际运行版本，例如 Node 22 LTS。

#### 风险二：`@types/express@5` 相对激进

- NestJS 11 当前虽然可运行于 Express 生态，但大量社区中间件与扩展类型仍以 Express 4 习惯为主。

风险表现：

- 后续如果扩展 `Request`、`Response` 类型，或接入中间件，可能产生类型不匹配。

建议：

- 若项目准备长期使用 Express 适配器，建议评估是否切换到更稳妥的 Express 4 对应类型策略，或尽早通过实际中间件验证。

#### 风险三：服务端测试链未补齐

`apps/server` 里定义了多条 Jest 脚本，但未在包中显式声明 `jest`、`@types/jest`、`ts-jest`、`@nestjs/testing` 等配套依赖。

风险表现：

- 测试脚本无法完整运行。
- 团队会误以为后端测试基础已经完备。

建议：

- 补齐最小测试依赖集合，并决定是否开启单元测试与 e2e 测试基线。

#### 风险四：`playground` 脱离 workspace

风险表现：

- 不受 workspace 统一依赖与任务管理控制。
- 容易变成“正式代码的临时落点”，造成结构漂移。

建议：

- 要么明确其仅用于个人实验并忽略正式管理。
- 要么纳入 workspace 并赋予明确职责边界。

## 8. 当前已有规则框架

### 8.1 TypeScript 规则基线

项目已经建立了较好的 TS 基线：

- 根 `tsconfig.json` 开启 `strict: true`。
- 根配置开启 `noUncheckedIndexedAccess`。
- 前端 `tsconfig.client.json` 开启严格校验与 `noUnusedLocals`、`noUnusedParameters`。
- 后端 `tsconfig.server.json` 启用了装饰器、元数据与增量编译。

但后端严格程度仍低于前端和根配置：

- `noImplicitAny: false`
- `noFallthroughCasesInSwitch: false`
- `strict` 未完整开启

### 8.2 代码风格规则

已存在统一风格：

- 使用 4 空格缩进。
- 使用单引号。
- 不使用分号。
- `printWidth` 为 140。
- lint-staged 会在提交前执行 ESLint + Prettier。

### 8.3 提交流程规则

已存在提交规范：

- pre-commit：执行 `lint-staged`
- commit-msg：执行 `commitlint`
- commit type 采用 Conventional Commits
- scope 已限制为 `docs`、`project`、`style`、`ci`、`dev`、`deploy`、`other`

### 8.4 命名与结构规则

从当前上下文与项目偏好可得出的统一要求：

- 文件与目录统一使用 camelCase。
- 避免 kebab-case 与 PascalCase 文件命名。
- 需要强化“目录职责单一”和“跨层依赖单向流动”规则。

## 9. 面向 TS + Vue3 + NestJS 的标准目标架构

以下是建议作为后续正式开发的标准目标结构，而不是当前已实现结构。

```text
fv-studio/
├─ apps/
│  ├─ web/                  # Vue3 用户端
│  │  ├─ src/
│  │  │  ├─ app/
│  │  │  ├─ pages/
│  │  │  ├─ widgets/
│  │  │  ├─ features/
│  │  │  ├─ entities/
│  │  │  ├─ shared/
│  │  │  └─ main.ts
│  │  └─ package.json
│  ├─ admin/                # Vue3 管理端
│  │  ├─ src/
│  │  │  ├─ app/
│  │  │  ├─ pages/
│  │  │  ├─ features/
│  │  │  ├─ entities/
│  │  │  ├─ shared/
│  │  │  └─ main.ts
│  │  └─ package.json
│  └─ server/               # NestJS 服务端
│     ├─ src/
│     │  ├─ main.ts
│     │  ├─ app.module.ts
│     │  ├─ modules/
│     │  │  └─ <domain>/
│     │  │     ├─ controllers/
│     │  │     ├─ services/
│     │  │     ├─ dto/
│     │  │     ├─ entities/
│     │  │     ├─ repositories/
│     │  │     └─ module.ts
│     │  ├─ common/
│     │  └─ infra/
│     └─ package.json
├─ packages/
│  ├─ core/                 # 共享领域模型、协议、常量、枚举
│  ├─ ui/                   # Vue3 共享组件库
│  ├─ utils/                # 纯工具函数
│  └─ agent/                # 智能体能力
└─ docs/                    # 架构与规范文档
```

## 10. 推荐的层间依赖规则

建议统一采用如下单向依赖：

```text
apps/web   ─┐
            ├─> packages/ui
apps/admin ─┤
            ├─> packages/core
            └─> packages/utils

apps/server ───> packages/core
apps/server ───> packages/utils

packages/ui ───> packages/core
packages/ui ───> packages/utils

packages/core ───> 不依赖 apps
packages/utils ───> 不依赖 apps
```

必须禁止：

- `packages/*` 反向依赖 `apps/*`
- `web` 与 `admin` 互相依赖
- 服务端直接依赖前端组件包
- `core` 依赖具体 UI 实现

## 11. 架构结论

当前项目已经具备“统一工程底座”，但还未进入“完整前后端分层协同开发”阶段。最合理的判断不是“现有架构已成型”，而是“已经搭好了 monorepo 工程基座，接下来需要按 TS + Vue3 + NestJS 的目标架构进行规范化填充”。

因此后续工作的优先级应为：

1. 完成 `apps/web` 与 `apps/admin` 的 Vue3 初始化。
2. 将 `packages/core`、`packages/utils` 明确为真实共享层。
3. 对 `apps/server` 建立模块化 NestJS 目录结构。
4. 建立统一 DTO、API 类型、校验、异常、版本策略。
5. 将规范沉淀为正式开发约定并强制执行。
