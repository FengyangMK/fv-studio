import { Logger, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'

import { AppModule } from './app.module'
import type { AppConfig } from './config/env.types'

async function bootstrap() {
    const app = await NestFactory.create(AppModule)

    // 启动阶段统一启用输入校验，避免非法请求绕过 DTO 约束。
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            whitelist: true,
            forbidNonWhitelisted: true,
        })
    )

    const configService = app.get(ConfigService)
    const appConfig = configService.getOrThrow<AppConfig>('app')

    // 根模块完成配置装配后，再设置全局路由前缀和监听端口。
    app.setGlobalPrefix(appConfig.apiPrefix)
    await app.listen(appConfig.port)

    return appConfig
}

bootstrap()
    .then(appConfig => {
        Logger.log(`Server is running at http://localhost:${appConfig.port}/${appConfig.apiPrefix}`)
    })
    .catch(err => {
        Logger.error('Failed to start server:', err)
    })
