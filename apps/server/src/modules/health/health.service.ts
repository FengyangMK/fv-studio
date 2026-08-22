import { Inject, Injectable, ServiceUnavailableException } from '@nestjs/common'
import type { ConfigType } from '@nestjs/config'

import { appConfig } from '../../config/configuration'
import { PrismaService } from '../../prisma/prisma.service'
import { HealthResponseDto } from './dto/health-response.dto'

@Injectable()
export class HealthService {
    constructor(
        private readonly prisma: PrismaService,
        @Inject(appConfig.KEY)
        private readonly appRuntimeConfig: ConfigType<typeof appConfig>
    ) {}

    async getStatus(): Promise<HealthResponseDto> {
        try {
            // 健康检查只验证最小数据库可达性，不引入额外业务查询。
            await this.prisma.$queryRaw`SELECT 1`
        } catch {
            throw new ServiceUnavailableException('Database connection is unavailable')
        }

        return {
            status: 'ok',
            service: 'server',
            environment: this.appRuntimeConfig.environment,
            database: 'up',
            timestamp: new Date().toISOString(),
        }
    }
}
