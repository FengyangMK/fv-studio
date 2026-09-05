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
    JWT_ACCESS_SECRET: Joi.string().min(5).required(),
    JWT_REFRESH_SECRET: Joi.string().min(5).required(),
    JWT_ACCESS_EXPIRES_IN: Joi.string().trim().min(1).default('15m'),
    JWT_REFRESH_EXPIRES_IN: Joi.string().trim().min(1).default('7d'),
    BCRYPT_SALT_ROUNDS: Joi.number().integer().min(10).max(15).default(12),
}).custom((value: Record<string, unknown>, helpers) => {
    if (value.JWT_ACCESS_SECRET === value.JWT_REFRESH_SECRET) {
        return helpers.error('any.invalid', {
            message: 'JWT access and refresh secrets must be different',
        })
    }

    if (
        value.NODE_ENV === 'production' &&
        (value.JWT_ACCESS_SECRET === 'development-access' || value.JWT_REFRESH_SECRET === 'development-refresh')
    ) {
        return helpers.error('any.invalid', {
            message: 'Development JWT secrets are not allowed in production',
        })
    }

    return value
})
