# Tasks

- [x] Task 1: 清理 `apps/server` 中测试阶段遗留的占位脚本与示例业务代码。
    - [x] SubTask 1.1: 清理 `package.json` 中无效的测试占位脚本与不必要的 `test` 目录脚本引用
    - [x] SubTask 1.2: 识别并移除 Prisma 中未被真实运行链路使用的示例业务模型及对应迁移或引用
    - [x] SubTask 1.3: 确保清理后 Prisma 与服务启动链路仍保持可用

- [x] Task 2: 整理已有 `apps/server` 代码结构与表达。
    - [x] SubTask 2.1: 统一关键文件的导入顺序、命名表达与职责边界
    - [x] SubTask 2.2: 保持 `config`、`prisma`、`modules/health` 和入口文件的结构清晰且不引入额外业务抽象
    - [x] SubTask 2.3: 避免保留仅用于演示、验证或临时过渡的无意义代码片段

- [x] Task 3: 为关键 server 代码补充简要注释说明。
    - [x] SubTask 3.1: 为启动入口与配置层补充职责说明注释
    - [x] SubTask 3.2: 为 Prisma 生命周期管理与数据库检查逻辑补充简要注释
    - [x] SubTask 3.3: 确保注释简洁、必要且不重复代码字面含义

- [x] Task 4: 验证清理与整理结果保持代码纯净且服务可用。
    - [x] SubTask 4.1: 验证 `apps/server` 中已无无效测试占位脚本与未使用示例模型残留
    - [x] SubTask 4.2: 验证 Prisma 相关命令、类型检查或构建仍可通过
    - [x] SubTask 4.3: 验证健康检查或最小运行链路保持正常

# Task Dependencies

- [Task 2] depends on [Task 1]
- [Task 3] depends on [Task 2]
- [Task 4] depends on [Task 1] and [Task 2] and [Task 3]
