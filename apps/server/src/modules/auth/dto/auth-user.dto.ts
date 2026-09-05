import { ApiProperty } from '@nestjs/swagger'

export class AuthUserDto {
    @ApiProperty({ description: '用户唯一标识。' })
    id!: string

    @ApiProperty({ description: '用户名称。' })
    name!: string

    @ApiProperty({ description: '用户邮箱地址。' })
    email!: string
}
