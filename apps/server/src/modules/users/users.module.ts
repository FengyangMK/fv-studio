import { Module } from '@nestjs/common'

import { PrismaModule } from '../../prisma/prisma.module'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'

/** 用户模块，负责当前用户资料查询与更新。 */
@Module({
    imports: [PrismaModule],
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService],
})
export class UsersModule {}
