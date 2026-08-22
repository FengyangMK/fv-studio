import { Logger, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

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
    const docsPath = 'docs'

    // 根模块完成配置装配后，再设置全局路由前缀和监听端口。
    app.setGlobalPrefix(appConfig.apiPrefix)

    const swaggerConfig = new DocumentBuilder()
        .setTitle('FV Studio Server API')
        .setDescription('Backend API documentation for health and user management endpoints.')
        .setVersion('1.0.0')
        .build()
    const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig)

    SwaggerModule.setup(docsPath, app, swaggerDocument)
    await app.listen(appConfig.port)

    return {
        ...appConfig,
        docsPath,
    }
}

bootstrap()
    .then(({ apiPrefix, docsPath, port }) => {
        Logger.log(`Server is running at http://localhost:${port}/${apiPrefix}`)
        Logger.log(`Swagger is available at http://localhost:${port}/${docsPath}`)
    })
    .catch(err => {
        Logger.error('Failed to start server:', err)
    })
