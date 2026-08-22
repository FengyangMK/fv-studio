import { registerAs } from '@nestjs/config'

import type { AppConfig, AppEnvironment, DatabaseConfig } from './env.types'

export const appConfig = registerAs('app', (): AppConfig => ({
    // 启动配置集中从环境变量读取，业务层只依赖类型化结果。
    environment: (process.env.NODE_ENV as AppEnvironment | undefined) ?? 'development',
    port: Number.parseInt(process.env.PORT ?? '3000', 10),
    apiPrefix: process.env.API_PREFIX ?? 'api',
}))

export const databaseConfig = registerAs('database', (): DatabaseConfig => ({
    // Prisma 与应用共用同一份数据库连接配置。
    url: process.env.DATABASE_URL ?? '',
}))
