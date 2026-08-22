import { Type } from 'class-transformer'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsInt, Max, Min } from 'class-validator'

export class ListUsersQueryDto {
    @ApiPropertyOptional({
        description: 'Page number, starting from 1',
        example: 1,
        default: 1,
        minimum: 1,
    })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page: number = 1

    @ApiPropertyOptional({
        description: 'Number of items per page',
        example: 10,
        default: 10,
        minimum: 1,
        maximum: 100,
    })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    pageSize: number = 10
}
