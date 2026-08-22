- [x] `spec.md` 明确说明本次变更包含 `apps/server/AGENT.md` 与 `docker/docker-compose.yml`

- [x] `apps/server/AGENT.md` 的规格要求覆盖 NestJS、PostgreSQL、Prisma、模块化组织与配置管理约束

- [x] `apps/server/AGENT.md` 的规格要求覆盖异常处理、校验、日志、测试或迁移等基础工程规则

- [x] `docker/docker-compose.yml` 的规格要求定义 PostgreSQL 本地开发服务

- [x] `docker/docker-compose.yml` 的规格要求明确将数据库数据持久化到 `docker/postgresql`

- [x] `docker/docker-compose.yml` 的规格要求包含端口映射、环境变量、健康检查与 bridge 网络约定

- [x] 任务拆解顺序能够支撑先写架构约束、再建数据库编排、最后做一致性校验
