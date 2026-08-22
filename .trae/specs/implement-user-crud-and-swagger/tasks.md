# Tasks

- [x] Task 1: 为 `apps/server` 建立 `User` 数据模型与 Prisma 数据库变更。
    - [x] SubTask 1.1: 在 `schema.prisma` 中新增 `User` 模型并定义最小必需字段与唯一约束
    - [x] SubTask 1.2: 生成对应迁移或等价数据库变更记录，并更新 Prisma Client
    - [x] SubTask 1.3: 确保模型设计与当前 PostgreSQL / Prisma 初始化方案兼容

- [x] Task 2: 落地按功能模块组织的 `User` 模块 CRUD 能力。
    - [x] SubTask 2.1: 在 `src/modules/users` 下创建 module、controller、service、dto 等文件
    - [x] SubTask 2.2: 实现创建、列表、详情、更新、删除接口与对应服务逻辑
    - [x] SubTask 2.3: 处理唯一约束冲突、记录不存在等常见业务错误

- [x] Task 3: 为 `User` 模块补齐输入校验、响应结构与 Swagger 装饰信息。
    - [x] SubTask 3.1: 为创建、更新、路由参数与查询参数定义 DTO，并接入 `class-validator`
    - [x] SubTask 3.2: 为用户响应定义清晰结构，避免直接暴露不必要字段
    - [x] SubTask 3.3: 使用 `@nestjs/swagger` 为模块、接口、DTO 和响应补齐基础文档元数据

- [x] Task 4: 在应用启动链路中接入 Swagger 文档入口。
    - [x] SubTask 4.1: 补齐 `@nestjs/swagger` 运行时所需依赖
    - [x] SubTask 4.2: 在 `main.ts` 中配置 Swagger 文档标题、版本、描述与访问路由
    - [x] SubTask 4.3: 将 `User` 模块装配到根模块，并保持现有健康检查链路可用

- [x] Task 5: 验证 User CRUD 与 Swagger 文档可用。
    - [x] SubTask 5.1: 验证 Prisma 命令、类型检查或构建通过
    - [x] SubTask 5.2: 验证 User CRUD 基础接口可正常访问
    - [x] SubTask 5.3: 验证 Swagger 文档页面可访问且能展示 User 模块接口

# Task Dependencies

- [Task 2] depends on [Task 1]
- [Task 3] depends on [Task 2]
- [Task 4] depends on [Task 2] and [Task 3]
- [Task 5] depends on [Task 1] and [Task 2] and [Task 3] and [Task 4]
