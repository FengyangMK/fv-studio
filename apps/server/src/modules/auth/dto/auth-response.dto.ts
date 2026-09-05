import { ApiProperty } from '@nestjs/swagger'

import { AuthUserDto } from './auth-user.dto'

export class AuthResponseDto {
    @ApiProperty({ description: '访问令牌。' })
    accessToken!: string

    @ApiProperty({ description: '刷新令牌。' })
    refreshToken!: string

    @ApiProperty({ description: '访问令牌类型。', example: 'Bearer' })
    tokenType!: 'Bearer'

    @ApiProperty({ description: '访问令牌有效期，单位为秒。', example: 900 })
    expiresIn!: number

    @ApiProperty({ description: '刷新令牌有效期，单位为秒。', example: 604800 })
    refreshExpiresIn!: number

    @ApiProperty({ description: '当前用户信息。', type: AuthUserDto })
    user!: AuthUserDto
}
