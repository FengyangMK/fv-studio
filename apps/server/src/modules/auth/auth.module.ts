import { Module } from '@nestjs/common'
import { ConfigType } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'

import { authConfig } from '../../config/configuration'
import { PrismaModule } from '../../prisma/prisma.module'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { AccessTokenGuard } from './guards/access-token.guard'
import { RefreshTokenGuard } from './guards/refresh-token.guard'
import { AccessTokenStrategy } from './strategies/access-token.strategy'
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy'

@Module({
    imports: [
        PrismaModule,
        PassportModule,
        JwtModule.registerAsync({
            inject: [authConfig.KEY],
            useFactory: (config: ConfigType<typeof authConfig>) => ({
                secret: config.accessSecret,
                signOptions: { algorithm: 'HS256' as const },
            }),
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, AccessTokenStrategy, RefreshTokenStrategy, AccessTokenGuard, RefreshTokenGuard],
    exports: [AuthService, AccessTokenGuard],
})
export class AuthModule {}
