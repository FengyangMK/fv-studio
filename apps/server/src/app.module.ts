import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core'

import { appConfig, authConfig, databaseConfig } from './config/configuration'
import { envValidationSchema } from './config/env.validation'
import { AuthModule } from './modules/auth/auth.module'
import { HealthModule } from './modules/health/health.module'
import { UsersModule } from './modules/users/users.module'
import { PrismaModule } from './prisma/prisma.module'
import { HttpExceptionFilter } from './shared/filters/http-exception.filter'
import { ResponseInterceptor } from './shared/interceptors/response.interceptor'

@Module({
    imports: [
        // 根模块只负责装配配置与基础设施，不承载业务逻辑。
        ConfigModule.forRoot({
            isGlobal: true,
            cache: true,
            envFilePath: ['.env'],
            load: [appConfig, databaseConfig, authConfig],
            validationSchema: envValidationSchema,
            validationOptions: {
                abortEarly: true,
                allowUnknown: true,
            },
        }),
        PrismaModule,
        HealthModule,
        AuthModule,
        UsersModule,
    ],
    providers: [
        {
            provide: APP_INTERCEPTOR,
            useClass: ResponseInterceptor,
        },
        {
            provide: APP_FILTER,
            useClass: HttpExceptionFilter,
        },
    ],
})
export class AppModule {}
