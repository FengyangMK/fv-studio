import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator'

export class LoginDto {
    @ApiProperty({ description: '用户注册时使用的邮箱地址。', example: 'alice@example.com' })
    @IsEmail()
    @MaxLength(320)
    email!: string

    @ApiProperty({ description: '用户密码。', example: 'password123' })
    @IsString()
    @MinLength(8)
    @MaxLength(128)
    password!: string
}
