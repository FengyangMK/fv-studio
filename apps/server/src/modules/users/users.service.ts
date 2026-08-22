import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma, type User } from '@prisma/client'

import { PrismaService } from '../../prisma/prisma.service'
import { CreateUserDto } from './dto/create-user.dto'
import { ListUsersQueryDto } from './dto/list-users-query.dto'
import { UserListResponseDto } from './dto/user-list-response.dto'
import { UserResponseDto } from './dto/user-response.dto'
import { UpdateUserDto } from './dto/update-user.dto'

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) {}

    async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
        try {
            const user = await this.prisma.user.create({
                data: {
                    name: createUserDto.name,
                    email: createUserDto.email,
                },
            })

            return this.toUserResponseDto(user)
        } catch (error) {
            this.handleKnownWriteError(error, createUserDto.email)
            throw error
        }
    }

    async findAll(query: ListUsersQueryDto): Promise<UserListResponseDto> {
        const { page, pageSize } = query
        const skip = (page - 1) * pageSize

        const [users, total] = await this.prisma.$transaction([
            this.prisma.user.findMany({
                skip,
                take: pageSize,
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            this.prisma.user.count(),
        ])

        return {
            items: users.map(user => this.toUserResponseDto(user)),
            total,
            page,
            pageSize,
        }
    }

    async findOne(id: string): Promise<UserResponseDto> {
        const user = await this.prisma.user.findUnique({
            where: { id },
        })

        if (!user) {
            throw new NotFoundException(`User with id "${id}" was not found`)
        }

        return this.toUserResponseDto(user)
    }

    async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
        const data: Prisma.UserUpdateInput = {}

        if (updateUserDto.name !== undefined) {
            data.name = updateUserDto.name
        }

        if (updateUserDto.email !== undefined) {
            data.email = updateUserDto.email
        }

        if (Object.keys(data).length === 0) {
            throw new BadRequestException('At least one updatable field must be provided')
        }

        try {
            const user = await this.prisma.user.update({
                where: { id },
                data,
            })

            return this.toUserResponseDto(user)
        } catch (error) {
            this.handleKnownWriteError(error, updateUserDto.email, id)
            throw error
        }
    }

    async remove(id: string): Promise<void> {
        try {
            await this.prisma.user.delete({
                where: { id },
            })
        } catch (error) {
            this.handleKnownWriteError(error, undefined, id)
            throw error
        }
    }

    private toUserResponseDto(user: User): UserResponseDto {
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
        }
    }

    private handleKnownWriteError(error: unknown, email?: string, userId?: string): never | void {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            throw new ConflictException(`User with email "${email ?? 'provided email'}" already exists`)
        }

        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            throw new NotFoundException(`User with id "${userId}" was not found`)
        }
    }
}
