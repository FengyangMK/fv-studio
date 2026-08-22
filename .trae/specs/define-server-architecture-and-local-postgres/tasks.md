# Tasks

- [x] Task 1: 编写 `apps/server/AGENT.md` 架构约束文档，明确 NestJS 后端的目录组织、模块边界与基础工程规范。
    - [x] SubTask 1.1: 约束 `apps/server` 采用 NestJS + PostgreSQL + Prisma 的技术栈基线
    - [x] SubTask 1.2: 约束代码按功能模块组织，明确 controller、service、dto、prisma、config、shared 等推荐结构
    - [x] SubTask 1.3: 约束配置管理、参数校验、异常处理、日志、测试与数据库迁移方式

- [x] Task 2: 在 `docker/docker-compose.yml` 中定义本地 PostgreSQL 开发环境。
    - [x] SubTask 2.1: 新增 PostgreSQL 服务，补齐镜像、容器名、端口映射与基础环境变量
    - [x] SubTask 2.2: 将数据库数据目录绑定到 `docker/postgresql`
    - [x] SubTask 2.3: 增加健康检查与 bridge 网络配置，保证本地服务接入一致性

- [x] Task 3: 校验文档与编排配置的一致性，确保 `apps/server` 后续可以按规范接入数据库。
    - [x] SubTask 3.1: 检查 `AGENT.md` 中的数据库与 Prisma 约束是否和 Docker 编排约定一致
    - [x] SubTask 3.2: 检查路径、文件名与 monorepo 目录结构是否一致
    - [x] SubTask 3.3: 运行基础静态核对，确认配置意图清晰且可执行

# Task Dependencies

- [Task 2] depends on [Task 1] 中定义的数据库接入与工程约束
- [Task 3] depends on [Task 1] and [Task 2]
