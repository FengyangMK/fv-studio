import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { appConfig, databaseConfig } from './config/configuration'
import { envValidationSchema } from './config/env.validation'
import { HealthModule } from './modules/health/health.module'
import { PrismaModule } from './prisma/prisma.module'

@Module({
    imports: [
        // 根模块只负责装配配置与基础设施，不承载业务逻辑。
        ConfigModule.forRoot({
            isGlobal: true,
            cache: true,
            envFilePath: ['.env.local', '.env'],
            load: [appConfig, databaseConfig],
            validationSchema: envValidationSchema,
            validationOptions: {
                abortEarly: true,
                allowUnknown: true,
            },
        }),
        PrismaModule,
        HealthModule,
    ],
})
export class AppModule {}
