import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator'

export class RegisterDto {
    @ApiProperty({ description: '用户名称。', example: 'Alice' })
    @IsString()
    @IsNotEmpty()
    @MinLength(1)
    @MaxLength(100)
    name!: string

    @ApiProperty({ description: '用户邮箱地址，系统会统一转换为小写。', example: 'alice@example.com' })
    @IsEmail()
    @MaxLength(320)
    email!: string

    @ApiProperty({ description: '用户密码，长度为 8 至 128 个字符。', example: 'password123' })
    @IsString()
    @MinLength(8)
    @MaxLength(128)
    password!: string
}
