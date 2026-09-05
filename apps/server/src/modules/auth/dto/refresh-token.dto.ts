import { IsJWT, IsNotEmpty, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class RefreshTokenDto {
    @ApiProperty({ description: '用于换取新令牌的刷新令牌。' })
    @IsString()
    @IsNotEmpty()
    @IsJWT()
    refreshToken!: string
}
