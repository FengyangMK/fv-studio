import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { Logger } from '@nestjs/common'

const port = process.env.PORT ?? 3000

async function bootstrap() {
    const app = await NestFactory.create(AppModule)
    await app.listen(port)
}

bootstrap()
    .then(() => {
        Logger.log(`Server is running http://localhost:${port}`)
    })
    .catch(err => {
        Logger.error('Failed to start server:', err)
    })
