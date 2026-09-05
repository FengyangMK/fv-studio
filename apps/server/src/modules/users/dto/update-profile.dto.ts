import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator'

/** 当前用户资料更新请求。 */
export class UpdateProfileDto {
    @ApiProperty({ description: '用户名称。', example: 'Alice' })
    @IsString()
    @IsNotEmpty()
    @MinLength(1)
    @MaxLength(100)
    name!: string
}
