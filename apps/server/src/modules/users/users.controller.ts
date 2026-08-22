import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common'
import {
    ApiBadRequestResponse,
    ApiConflictResponse,
    ApiCreatedResponse,
    ApiNoContentResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiTags,
} from '@nestjs/swagger'

import { CreateUserDto } from './dto/create-user.dto'
import { ListUsersQueryDto } from './dto/list-users-query.dto'
import { UserIdParamDto } from './dto/user-id-param.dto'
import { UserListResponseDto } from './dto/user-list-response.dto'
import { UserResponseDto } from './dto/user-response.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { UsersService } from './users.service'

@ApiTags('Users')
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post()
    @ApiOperation({ summary: 'Create a user' })
    @ApiCreatedResponse({ type: UserResponseDto })
    @ApiBadRequestResponse({ description: 'Request body validation failed' })
    @ApiConflictResponse({ description: 'Email address already exists' })
    create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
        return this.usersService.create(createUserDto)
    }

    @Get()
    @ApiOperation({ summary: 'List users' })
    @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
    @ApiQuery({ name: 'pageSize', required: false, type: Number, example: 10 })
    @ApiOkResponse({ type: UserListResponseDto })
    @ApiBadRequestResponse({ description: 'Query parameter validation failed' })
    findAll(@Query() query: ListUsersQueryDto): Promise<UserListResponseDto> {
        return this.usersService.findAll(query)
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a user by id' })
    @ApiParam({ name: 'id', type: String, description: 'User ID' })
    @ApiOkResponse({ type: UserResponseDto })
    @ApiBadRequestResponse({ description: 'Route parameter validation failed' })
    @ApiNotFoundResponse({ description: 'User not found' })
    findOne(@Param() params: UserIdParamDto): Promise<UserResponseDto> {
        return this.usersService.findOne(params.id)
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a user' })
    @ApiParam({ name: 'id', type: String, description: 'User ID' })
    @ApiOkResponse({ type: UserResponseDto })
    @ApiBadRequestResponse({
        description: 'Route parameter or request body validation failed',
    })
    @ApiConflictResponse({ description: 'Email address already exists' })
    @ApiNotFoundResponse({ description: 'User not found' })
    update(@Param() params: UserIdParamDto, @Body() updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
        return this.usersService.update(params.id, updateUserDto)
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete a user' })
    @ApiParam({ name: 'id', type: String, description: 'User ID' })
    @ApiNoContentResponse({ description: 'User deleted successfully' })
    @ApiBadRequestResponse({ description: 'Route parameter validation failed' })
    @ApiNotFoundResponse({ description: 'User not found' })
    remove(@Param() params: UserIdParamDto): Promise<void> {
        return this.usersService.remove(params.id)
    }
}
