import { Injectable, NotFoundException } from '@nestjs/common'

import { PrismaService } from '../../prisma/prisma.service'
import type { AuthUserDto } from '../auth/dto/auth-user.dto'
import type { UpdateProfileDto } from './dto/update-profile.dto'

/** 提供用户资料查询与更新能力。 */
@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) {}

    /**
     * 获取公开用户资料。
     * @param userId 用户 ID
     * @returns 用户公开信息
     */
    async getPublicProfile(userId: string): Promise<AuthUserDto> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, email: true },
        })
        if (!user) {
            throw new NotFoundException('用户不存在')
        }
        return user
    }

    /**
     * 更新当前用户资料。
     * @param userId 用户 ID
     * @param dto 用户资料更新请求
     * @returns 更新后的用户公开信息
     */
    async updateProfile(userId: string, dto: UpdateProfileDto): Promise<AuthUserDto> {
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: { name: dto.name.trim() },
            select: { id: true, name: true, email: true },
        })
        return user
    }
}
