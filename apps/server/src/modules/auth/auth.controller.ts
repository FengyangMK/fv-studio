import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiBody, ApiNoContentResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

import { AccessTokenGuard } from './guards/access-token.guard'
import { RefreshTokenGuard } from './guards/refresh-token.guard'
import type { AccessTokenRequest, RefreshTokenRequest } from './interfaces/authenticated-request.interface'
import { AuthService } from './auth.service'
import { AuthResponseDto } from './dto/auth-response.dto'
import { AuthUserDto } from './dto/auth-user.dto'
import { LoginDto } from './dto/login.dto'
import { RefreshTokenDto } from './dto/refresh-token.dto'
import { RegisterDto } from './dto/register.dto'

/** 提供注册、登录、令牌刷新、用户查询和会话撤销 HTTP 接口。 */
@ApiTags('认证')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    /** @param dto 注册请求体 @returns 双令牌和用户信息 */
    @Post('register')
    @ApiOperation({ summary: '注册用户并创建会话' })
    @ApiResponse({ status: 201, description: '注册成功，返回访问令牌、刷新令牌和用户信息。', type: AuthResponseDto })
    register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
        return this.authService.register(dto)
    }

    /** @param dto 登录请求体 @returns 双令牌和用户信息 */
    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: '使用邮箱和密码登录' })
    @ApiResponse({ status: 200, description: '登录成功，返回访问令牌、刷新令牌和用户信息。', type: AuthResponseDto })
    login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
        return this.authService.login(dto)
    }

    /** @param request Passport 注入的刷新令牌载荷 @param dto 刷新请求体 @returns 轮换后的双令牌 */
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    @UseGuards(RefreshTokenGuard)
    @ApiOperation({ summary: '刷新并轮换令牌' })
    @ApiBody({ type: RefreshTokenDto, description: '包含当前刷新令牌的请求体。' })
    @ApiResponse({ status: 200, description: '刷新成功，返回新的访问令牌和刷新令牌。', type: AuthResponseDto })
    refresh(@Req() request: RefreshTokenRequest, @Body() dto: RefreshTokenDto): Promise<AuthResponseDto> {
        return this.authService.refresh(request.user, dto)
    }

    /** @param request Passport 注入的访问令牌载荷 @returns 当前用户公开信息 */
    @Get('me')
    @UseGuards(AccessTokenGuard)
    @ApiBearerAuth('访问令牌')
    @ApiOperation({ summary: '获取当前用户信息' })
    @ApiResponse({ status: 200, description: '返回当前访问令牌对应的用户信息。', type: AuthUserDto })
    me(@Req() request: AccessTokenRequest): Promise<AuthUserDto> {
        return this.authService.getCurrentUser(request.user)
    }

    /** @param dto 包含待撤销刷新令牌的请求体 */
    @Post('logout')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: '注销当前会话' })
    @ApiNoContentResponse({ description: '当前刷新会话已撤销；令牌无效或已过期时也会幂等返回成功。' })
    logout(@Body() dto: RefreshTokenDto): Promise<void> {
        return this.authService.logout(dto.refreshToken)
    }

    /** @param request Passport 注入的访问令牌载荷 */
    @Post('logout-all')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(AccessTokenGuard)
    @ApiBearerAuth('访问令牌')
    @ApiOperation({ summary: '注销当前用户的全部会话' })
    @ApiNoContentResponse({ description: '当前用户所有未撤销的刷新会话已撤销。' })
    logoutAll(@Req() request: AccessTokenRequest): Promise<void> {
        return this.authService.logoutAll(request.user)
    }
}
