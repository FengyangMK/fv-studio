import { ApiProperty } from '@nestjs/swagger'

import { UserResponseDto } from './user-response.dto'

export class UserListResponseDto {
    @ApiProperty({
        description: 'Users in the current page',
        type: UserResponseDto,
        isArray: true,
    })
    items!: UserResponseDto[]

    @ApiProperty({
        description: 'Total number of users',
        example: 1,
    })
    total!: number

    @ApiProperty({
        description: 'Current page number',
        example: 1,
    })
    page!: number

    @ApiProperty({
        description: 'Number of items per page',
        example: 10,
    })
    pageSize!: number
}
