# FV Studio 前后端统一开发约定

## 1. 目标与适用范围

本规范适用于 `fv-studio` monorepo 下所有正式业务代码，统一约束以下范围：

- TypeScript 类型系统
- Vue3 前端开发
- NestJS 后端开发
- 公共包设计
- API 定义与类型共享
- 命名、目录、提交、版本与依赖治理

本规范的核心目标是：

- 保持前后端代码风格统一
- 保证共享类型与接口定义单一可信来源
- 降低跨应用耦合
- 提高模块可维护性、可测试性与可演进性

## 2. 基础原则

### 2.1 单一职责

- 一个目录只承载一类职责。
- 一个文件只表达一个清晰概念。
- 一个模块只暴露稳定、明确的公共接口。

### 2.2 单向依赖

- 应用层可以依赖公共包层。
- 公共包层不能反向依赖应用层。
- 低层能力不感知高层业务。

### 2.3 类型先行

- 先定义类型、协议、边界，再实现业务逻辑。
- 前后端交互接口必须以 TypeScript 类型为统一契约。

### 2.4 显式优于隐式

- 依赖必须显式声明。
- 导出必须显式管理。
- 类型转换必须显式处理。
- 异常分支必须显式表达。

## 3. 目录分层约定

## 3.1 根目录

根目录只放以下内容：

- monorepo 配置
- 工程化脚本
- 通用 TS、ESLint、Prettier、Commitlint 规则
- 文档

禁止：

- 在根目录散落业务源码
- 在根目录直接放页面、控制器、服务、组件实现

## 3.2 应用层 `apps`

### `apps/web`

- 面向用户端的 Vue3 应用
- 负责页面编排、交互流程、状态协作
- 可依赖 `packages/core`、`packages/ui`、`packages/utils`

### `apps/admin`

- 面向运营或后台管理的 Vue3 应用
- 负责管理流程、权限界面、后台配置
- 可依赖 `packages/core`、`packages/ui`、`packages/utils`

### `apps/server`

- NestJS 后端服务
- 负责 API、业务编排、鉴权、持久化、任务调度
- 可依赖 `packages/core`、`packages/utils`
- 不直接依赖 `packages/ui`

## 3.3 公共层 `packages`

### `packages/core`

存放：

- 共享类型
- DTO 基础定义
- 枚举
- 常量
- 领域模型
- 接口协议

禁止：

- 引入浏览器 API
- 引入 Node 专属运行时 API
- 放具体页面或具体模块实现

### `packages/ui`

存放：

- 可复用 Vue3 组件
- 布局组件
- 主题令牌
- 设计系统基础能力

禁止：

- 直接依赖业务页面
- 写死业务接口地址

### `packages/utils`

存放：

- 纯函数工具
- 字符串、数组、对象、日期、URL 等通用处理
- 可跨端复用的无状态能力

禁止：

- 放业务耦合逻辑
- 放与某一应用强绑定的配置

### `packages/agent`

存放：

- 智能体流程编排
- 模型调用适配
- Prompt 约束与执行器

禁止：

- 将其作为通用垃圾桶目录

## 4. 命名规范

### 4.1 文件与目录

强制要求：

- 所有文件名与目录名统一使用 camelCase
- 严禁使用 kebab-case
- 严禁使用 PascalCase 文件名

推荐示例：

- `userService.ts`
- `userController.ts`
- `userProfileCard.vue`
- `useUserList.ts`
- `requestClient.ts`
- `loginPage`

不推荐示例：

- `user-service.ts`
- `UserService.ts`
- `user_profile.ts`

### 4.2 TypeScript 标识符

- 类型、接口、类名使用 PascalCase
- 变量、函数、对象属性使用 camelCase
- 常量枚举值可使用全大写下划线风格，但应控制范围
- 布尔变量优先使用 `is`、`has`、`can`、`should` 前缀

### 4.3 Vue3 组件命名

- 组件文件名遵循 camelCase
- 组件导出名使用 PascalCase
- 基础组件使用语义前缀，如 `baseButton`、`baseDialog`
- 业务组件使用领域前缀，如 `userProfilePanel`

## 5. TypeScript 统一规范

### 5.1 严格模式

全仓库目标：

- 强制开启 `strict: true`
- 强制开启 `noUncheckedIndexedAccess`
- 强制开启 `noImplicitAny`
- 强制开启 `noFallthroughCasesInSwitch`
- 强制开启 `forceConsistentCasingInFileNames`

当前项目应补齐：

- `tsconfig.server.json` 的 `noImplicitAny`
- `tsconfig.server.json` 的完整严格模式

### 5.2 类型定义原则

- 优先使用 `type` 描述组合类型、联合类型、映射类型
- 当需要可扩展对象契约时再使用 `interface`
- 禁止滥用 `any`
- 优先使用 `unknown` 替代 `any`
- 所有函数返回值必须可推导或显式标注
- 对外暴露 API 必须显式声明返回类型

### 5.3 空值与可选值处理

- 严格区分 `undefined` 与 `null`
- 只有在接口契约明确要求时才使用 `null`
- 可选属性必须考虑未传场景
- 禁止用非空断言 `!` 掩盖真实类型问题，除非有充分注释说明

### 5.4 导出规则

- 每个包都必须使用单一入口导出文件，如 `src/index.ts`
- 跨目录引用优先走公共导出，不直接穿透深层实现文件
- 禁止循环依赖

## 6. Vue3 开发约定

### 6.1 组件开发方式

- 统一使用 Vue3 组合式 API
- 统一使用 `script setup` 风格
- 组件逻辑按“props -> emits -> state -> computed -> methods -> lifecycle”组织
- 组件副作用必须集中在组合函数或生命周期钩子中

### 6.2 页面分层建议

前端目录建议遵循：

```text
src/
├─ app/          # 应用初始化、路由、provider
├─ pages/        # 页面级路由入口
├─ widgets/      # 页面级组合模块
├─ features/     # 业务功能片段
├─ entities/     # 领域实体展示与局部逻辑
├─ shared/       # 纯共享能力
└─ main.ts
```

### 6.3 状态管理约定

- 页面临时状态保留在页面或局部组件
- 跨页面共享状态才进入全局 store
- store 只存可复用状态，不存纯展示逻辑
- 异步请求状态应封装为组合函数或服务层

### 6.4 组件边界

- UI 组件不直接发请求
- UI 组件不耦合接口地址
- 业务组件通过 props 和 emits 组合 UI 组件
- 页面层负责拼装数据请求、路由和权限逻辑

### 6.5 组合函数约定

- 组合函数统一以 `use` 开头
- 组合函数职责单一，避免大而全
- 组合函数返回值必须有明确类型
- 组合函数内部的副作用需要可预期、可清理

## 7. NestJS 开发约定

### 7.1 模块化结构

后端按领域模块拆分，推荐结构：

```text
src/
├─ main.ts
├─ app.module.ts
├─ modules/
│  └─ user/
│     ├─ controllers/
│     ├─ services/
│     ├─ dto/
│     ├─ entities/
│     ├─ repositories/
│     └─ user.module.ts
├─ common/
│  ├─ decorators/
│  ├─ filters/
│  ├─ guards/
│  ├─ interceptors/
│  └─ pipes/
└─ infra/
   ├─ database/
   ├─ cache/
   └─ config/
```

### 7.2 控制器约定

- Controller 只负责接收请求、参数解析、调用 Service、返回响应
- Controller 中禁止写复杂业务逻辑
- 每个路由处理函数都要有明确返回类型
- 输入参数必须走 DTO 或 Pipe 校验

### 7.3 服务层约定

- Service 负责业务编排
- Service 不直接处理 HTTP 语义
- Service 不返回框架耦合对象
- 复杂业务拆分为领域服务，避免单个 Service 过大

### 7.4 DTO 与校验

- 请求入参统一定义为 DTO
- DTO 必须可读、可复用、可扩展
- 更新场景建议使用 `PartialType` 等方式组合 DTO
- 校验规则必须和 DTO 放在同层目录

### 7.5 异常处理

- 业务异常统一抛出明确的框架异常或自定义异常
- 不允许直接向上抛裸字符串
- 统一错误响应结构
- 在全局过滤器中统一收敛未知异常

### 7.6 配置管理

- 所有环境变量统一通过配置层读取
- 禁止在业务代码中到处直接读取 `process.env`
- 配置项必须有类型定义与默认值策略

## 8. 接口与类型共享规范

### 8.1 接口定义来源

前后端统一约定：

- 接口输入输出类型优先沉淀到 `packages/core`
- 服务端 DTO 与前端消费类型要么直接共享，要么通过映射层统一转换
- 一份协议只能有一个权威来源

### 8.2 接口命名建议

- 查询参数：`xxxQuery`
- 创建参数：`createXxxDto`
- 更新参数：`updateXxxDto`
- 列表项：`xxxItem`
- 详情响应：`xxxDetail`
- 分页响应：`pageResult<T>`

### 8.3 响应结构建议

统一建议：

```ts
type apiResponse<T> = {
    code: string
    message: string
    data: T
    traceId?: string
}

type pageResult<T> = {
    list: T[]
    total: number
    page: number
    pageSize: number
}
```

### 8.4 类型边界

- 前端不得直接依赖数据库实体结构
- 服务端不得把 ORM 实体原样暴露给前端
- API 输出必须是显式定义过的响应模型

## 9. 数据校验与输入安全

### 9.1 服务端校验

- 所有外部输入都必须校验
- 路径参数、查询参数、请求体都不能跳过校验
- 数字、枚举、日期、布尔值都要做显式转换与校验

### 9.2 前端校验

- 表单校验规则应与后端约束保持一致
- 前端校验用于提升体验，不替代服务端校验
- 关键业务约束必须以后端为准

## 10. 代码风格规范

遵循当前项目已有配置，并提升为统一规则：

- 使用 4 空格缩进
- 使用单引号
- 不使用分号
- 行宽以 140 为上限
- import 顺序必须稳定、可读
- 保持一个文件内导入、常量、类型、实现顺序清晰

补充要求：

- 注释只写必要信息，不写废话注释
- 复杂逻辑前允许写简洁说明性注释
- 禁止保留调试用 `console.log` 到正式提交

## 11. 依赖管理规范

### 11.1 依赖归属

- 工程级工具依赖放根目录
- 应用运行时依赖放各自 app 包
- 可复用运行时依赖放对应 `packages/*`
- 不允许依赖“借道”其他包存在

### 11.2 版本策略

- 全仓库核心依赖要统一主版本
- Node 类型版本全仓库统一
- TypeScript 版本全仓库统一
- Vue3 相关核心依赖统一版本
- NestJS 相关核心依赖统一版本

### 11.3 依赖审查

新增依赖前必须回答：

- 是否已有现成能力可复用
- 是否真的需要运行时依赖
- 是否会造成体积、兼容性或维护成本问题
- 是否适合沉淀到公共包

## 12. 脚本与工程流程规范

### 12.1 脚本命名

每个包统一保留以下脚本语义：

- `dev`：开发模式启动
- `build`：正式构建
- `lint`：静态检查
- `test`：单元测试
- `test:e2e`：端到端测试

### 12.2 提交流程

- 提交前必须通过 `lint-staged`
- 提交信息必须通过 `commitlint`
- 提交类型统一使用 Conventional Commits

推荐 scope 扩展为：

- `web`
- `admin`
- `server`
- `core`
- `ui`
- `utils`
- `agent`
- `docs`
- `project`

## 13. 测试规范

### 13.1 前端

- 页面复杂交互必须覆盖组件测试或集成测试
- 纯工具函数必须有单元测试
- 可复用组合函数建议覆盖测试

### 13.2 后端

- Service 层需要覆盖单元测试
- Controller 层至少覆盖关键接口集成测试
- 核心业务链路需要 e2e 测试

### 13.3 共享包

- `packages/core` 与 `packages/utils` 中的纯逻辑优先补单元测试
- `packages/ui` 中通用组件至少覆盖关键交互与渲染测试

## 14. 当前项目落地整改建议

基于现状，建议按以下顺序推进：

1. 初始化 `apps/web` 与 `apps/admin`，建立 Vue3 + TypeScript + Vite 基础结构。
2. 将 `packages/core` 明确为共享类型与协议中心。
3. 将 `packages/utils` 建立为纯工具层。
4. 将 `apps/server` 重构为模块化 NestJS 目录。
5. 统一全仓库 `@types/node` 版本。
6. 补齐 `apps/server` 的测试依赖与测试基础设施。
7. 评估 `playground` 是否纳入 workspace。
8. 将本规范与架构报告作为正式开发基线文档长期维护。

## 15. 最终执行标准

当项目进入正式开发后，每一次新增模块都必须满足以下检查项：

- 目录命名是否符合 camelCase
- 是否遵守单向依赖
- 是否定义了清晰类型边界
- 是否避免跨层直接引用实现细节
- 是否具备最小测试能力
- 是否符合统一脚本、提交、格式化与 lint 规则

只要上述规则持续执行，`fv-studio` 就可以逐步从“工程脚手架”稳定演进为“前后端统一规范、共享边界清晰、可长期维护的全栈 monorepo”。
