import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class UserIdParamDto {
    @ApiProperty({
        description: 'User ID',
        example: 'cm0abcdefghijklmnopqrstuv',
    })
    @IsString()
    @IsNotEmpty()
    id!: string
}
