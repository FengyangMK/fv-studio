import { ApiProperty } from '@nestjs/swagger'

export class UserResponseDto {
    @ApiProperty({
        description: 'User ID',
        example: 'cm0abcdefghijklmnopqrstuv',
    })
    id!: string

    @ApiProperty({
        description: 'User display name',
        example: 'Ada Lovelace',
    })
    name!: string

    @ApiProperty({
        description: 'User email address',
        example: 'ada@example.com',
    })
    email!: string

    @ApiProperty({
        description: 'Creation timestamp',
        example: '2026-08-22T09:00:00.000Z',
        format: 'date-time',
    })
    createdAt!: string

    @ApiProperty({
        description: 'Last update timestamp',
        example: '2026-08-22T09:00:00.000Z',
        format: 'date-time',
    })
    updatedAt!: string
}
