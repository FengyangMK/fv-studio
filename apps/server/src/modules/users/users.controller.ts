import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

import { AccessTokenGuard } from '../auth/guards/access-token.guard'
import type { AccessTokenRequest } from '../auth/interfaces/authenticated-request.interface'
import { AuthUserDto } from '../auth/dto/auth-user.dto'
import { UpdateProfileDto } from './dto/update-profile.dto'
import { UsersService } from './users.service'

/** 提供当前登录用户资料接口。 */
@ApiTags('用户')
@ApiBearerAuth('访问令牌')
@UseGuards(AccessTokenGuard)
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    /** 获取当前用户资料。 */
    @Get('me')
    @ApiOperation({ summary: '获取当前用户资料' })
    @ApiResponse({ status: 200, description: '返回当前用户公开资料。', type: AuthUserDto })
    getCurrentProfile(@Req() request: AccessTokenRequest): Promise<AuthUserDto> {
        return this.usersService.getPublicProfile(request.user.sub)
    }

    /** 更新当前用户资料。 */
    @Patch('me')
    @ApiOperation({ summary: '更新当前用户资料' })
    @ApiResponse({ status: 200, description: '返回更新后的用户公开资料。', type: AuthUserDto })
    updateCurrentProfile(@Req() request: AccessTokenRequest, @Body() dto: UpdateProfileDto): Promise<AuthUserDto> {
        return this.usersService.updateProfile(request.user.sub, dto)
    }
}
