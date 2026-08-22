import * as Joi from 'joi'

import type { AppEnvironment } from './env.types'

const allowedNodeEnvironments: AppEnvironment[] = ['development', 'production', 'test']

// 启动前完成环境变量校验，避免运行时才暴露配置错误。
export const envValidationSchema = Joi.object({
    NODE_ENV: Joi.string()
        .valid(...allowedNodeEnvironments)
        .default('development'),
    PORT: Joi.number().integer().min(1).max(65535).default(3000),
    API_PREFIX: Joi.string().trim().min(1).default('api'),
    DATABASE_URL: Joi.string()
        .uri({ scheme: ['postgresql', 'postgres'] })
        .required(),
})
