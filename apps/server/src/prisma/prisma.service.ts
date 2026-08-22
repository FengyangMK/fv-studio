import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import type { ConfigType } from '@nestjs/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

import { databaseConfig } from '../config/configuration'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(PrismaService.name)

    constructor(
        @Inject(databaseConfig.KEY)
        private readonly dbConfig: ConfigType<typeof databaseConfig>
    ) {
        super({
            adapter: new PrismaPg({
                connectionString: dbConfig.url,
            }),
        })
    }

    // 跟随 Nest 生命周期建立连接，避免每个模块各自管理 Prisma 实例。
    async onModuleInit(): Promise<void> {
        await this.$connect()
        this.logger.log('Prisma client connected')
    }

    async onModuleDestroy(): Promise<void> {
        await this.$disconnect()
    }
}
