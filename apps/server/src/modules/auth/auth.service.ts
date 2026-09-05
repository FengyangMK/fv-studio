import { ConflictException, Inject, Injectable, Logger, UnauthorizedException, InternalServerErrorException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import type { ConfigType } from '@nestjs/config'
import { Prisma } from '@prisma/client'
import * as bcrypt from 'bcrypt'
import { createHash, randomUUID } from 'node:crypto'

import { authConfig } from '../../config/configuration'
import { PrismaService } from '../../prisma/prisma.service'
import type { LoginDto } from './dto/login.dto'
import type { RefreshTokenDto } from './dto/refresh-token.dto'
import type { RegisterDto } from './dto/register.dto'
import type { AuthResponseDto } from './dto/auth-response.dto'
import type { AuthUserDto } from './dto/auth-user.dto'
import type { AccessTokenPayload, RefreshTokenPayload } from './interfaces/auth-payload.interface'

interface TokenPair {
    accessToken: string
    refreshToken: string
    expiresIn: number
    refreshExpiresIn: number
}

/** 负责用户注册、登录、JWT 签发及刷新会话生命周期管理。 */
@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name)

    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
        @Inject(authConfig.KEY)
        private readonly config: ConfigType<typeof authConfig>
    ) {}

    /** 注册用户并创建首个刷新会话。 */
    async register(dto: RegisterDto): Promise<AuthResponseDto> {
        const email = this.normalizeEmail(dto.email)
        const existingUser = await this.prisma.user.findUnique({ where: { email } })
        if (existingUser) {
            throw new ConflictException('Email is already registered')
        }

        const passwordHash = await bcrypt.hash(dto.password, this.config.bcryptSaltRounds)
        let user: { id: string; name: string; email: string }
        try {
            user = await this.prisma.user.create({
                data: {
                    name: dto.name.trim(),
                    email,
                    passwordHash,
                },
            })
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new ConflictException('Email is already registered')
            }
            throw error
        }

        return this.createAuthResponse(user)
    }

    /** 校验邮箱密码并创建新的刷新会话。 */
    async login(dto: LoginDto): Promise<AuthResponseDto> {
        const user = await this.prisma.user.findUnique({
            where: { email: this.normalizeEmail(dto.email) },
        })
        if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
            throw new UnauthorizedException('Invalid email or password')
        }

        return this.createAuthResponse(user)
    }

    /** 校验并原子轮换刷新令牌；重放时撤销整个令牌 family。 */
    async refresh(payload: RefreshTokenPayload, dto: RefreshTokenDto): Promise<AuthResponseDto> {
        const session = await this.prisma.refreshSession.findUnique({
            where: { id: payload.sessionId },
            include: { user: true },
        })

        if (!session || session.userId !== payload.sub || session.familyId !== payload.familyId) {
            throw new UnauthorizedException('Invalid refresh session')
        }

        const tokenMatches = this.hashToken(dto.refreshToken) === session.tokenHash
        if (!tokenMatches) {
            throw new UnauthorizedException('Invalid refresh session')
        }

        if (session.revokedAt) {
            await this.revokeFamily(session.familyId)
            throw new UnauthorizedException('Refresh token has already been revoked')
        }

        if (session.expiresAt <= new Date()) {
            await this.revokeSession(session.id)
            throw new UnauthorizedException('Refresh token has expired')
        }

        const nextSessionId = randomUUID()
        const nextFamilyId = session.familyId
        const nextTokens = await this.signTokenPair(session.user, nextSessionId, nextFamilyId)
        const nextSessionIdForLog = nextSessionId
        try {
            await this.prisma.$transaction(async tx => {
                const updated = await tx.refreshSession.updateMany({
                    where: { id: session.id, revokedAt: null },
                    data: { revokedAt: new Date(), replacedById: nextSessionId },
                })
                if (updated.count !== 1) {
                    throw new UnauthorizedException('Refresh token has already been revoked')
                }

                await tx.refreshSession.create({
                    data: {
                        id: nextSessionId,
                        userId: session.userId,
                        familyId: nextFamilyId,
                        tokenHash: this.hashToken(nextTokens.refreshToken),
                        expiresAt: new Date(Date.now() + nextTokens.refreshExpiresIn * 1000),
                    },
                })
            })
        } catch (error) {
            if (error instanceof UnauthorizedException) {
                await this.revokeFamily(session.familyId)
                throw error
            }
            throw error
        }

        this.logger.debug(`Refresh session rotated: ${nextSessionIdForLog}`)
        return this.toAuthResponse(session.user, nextTokens)
    }

    /** 根据 Access Token 的 subject 返回当前用户公开信息。 */
    async getCurrentUser(payload: AccessTokenPayload): Promise<AuthUserDto> {
        const user = await this.prisma.user.findUnique({ where: { id: payload.sub } })
        if (!user) {
            throw new UnauthorizedException('User no longer exists')
        }
        return this.toPublicUser(user)
    }

    /** 撤销当前刷新会话；无效或过期令牌按幂等成功处理。 */
    async logout(refreshToken: string): Promise<void> {
        try {
            const payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(refreshToken, {
                secret: this.config.refreshSecret,
                algorithms: ['HS256'],
            })
            if (payload.type !== 'refresh' || !payload.sessionId) return
            await this.revokeSession(payload.sessionId)
        } catch {
            // Logout is intentionally idempotent for expired or already-invalid tokens.
        }
    }

    /** 撤销当前用户全部尚未撤销的刷新会话。 */
    async logoutAll(payload: AccessTokenPayload): Promise<void> {
        await this.prisma.refreshSession.updateMany({
            where: { userId: payload.sub, revokedAt: null },
            data: { revokedAt: new Date() },
        })
    }

    private async createAuthResponse(user: { id: string; name: string; email: string }): Promise<AuthResponseDto> {
        const sessionId = randomUUID()
        const familyId = randomUUID()
        const tokens = await this.signTokenPair(user, sessionId, familyId)
        await this.prisma.refreshSession.create({
            data: {
                id: sessionId,
                userId: user.id,
                familyId,
                tokenHash: this.hashToken(tokens.refreshToken),
                expiresAt: new Date(Date.now() + tokens.refreshExpiresIn * 1000),
            },
        })
        return this.toAuthResponse(user, tokens)
    }

    private async signTokenPair(user: { id: string; email: string }, sessionId: string, familyId: string): Promise<TokenPair> {
        const expiresIn = this.parseDuration(this.config.accessExpiresIn)
        const refreshExpiresIn = this.parseDuration(this.config.refreshExpiresIn)
        const accessPayload: AccessTokenPayload = {
            sub: user.id,
            email: user.email,
            type: 'access',
        }
        const refreshPayload: RefreshTokenPayload = {
            sub: user.id,
            sessionId,
            familyId,
            type: 'refresh',
        }

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(accessPayload, {
                secret: this.config.accessSecret,
                algorithm: 'HS256',
                expiresIn,
            }),
            this.jwtService.signAsync(refreshPayload, {
                secret: this.config.refreshSecret,
                algorithm: 'HS256',
                expiresIn: refreshExpiresIn,
            }),
        ])

        return { accessToken, refreshToken, expiresIn, refreshExpiresIn }
    }

    private toAuthResponse(user: { id: string; name: string; email: string }, tokens: TokenPair): AuthResponseDto {
        return {
            ...tokens,
            tokenType: 'Bearer',
            user: this.toPublicUser(user),
        }
    }

    private toPublicUser(user: { id: string; name: string; email: string }): AuthUserDto {
        return { id: user.id, name: user.name, email: user.email }
    }

    private async revokeSession(sessionId: string): Promise<void> {
        await this.prisma.refreshSession.updateMany({
            where: { id: sessionId, revokedAt: null },
            data: { revokedAt: new Date() },
        })
    }

    private async revokeFamily(familyId: string): Promise<void> {
        await this.prisma.refreshSession.updateMany({
            where: { familyId, revokedAt: null },
            data: { revokedAt: new Date() },
        })
    }

    private normalizeEmail(email: string): string {
        return email.trim().toLowerCase()
    }

    private hashToken(token: string): string {
        return createHash('sha256').update(token).digest('hex')
    }

    private parseDuration(value: string): number {
        const match = /^(\d+)\s*(s|m|h|d)$/.exec(value.trim().toLowerCase())
        if (!match) {
            throw new InternalServerErrorException(`Unsupported token duration: ${value}`)
        }
        const amount = Number(match[1])
        const multiplier = { s: 1, m: 60, h: 3600, d: 86400 }[match[2] as 's' | 'm' | 'h' | 'd']
        return amount * multiplier
    }
}
