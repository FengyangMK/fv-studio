import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator'

export class CreateUserDto {
    @ApiProperty({
        description: 'User display name',
        example: 'Ada Lovelace',
        maxLength: 100,
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    name!: string

    @ApiProperty({
        description: 'User email address',
        example: 'ada@example.com',
        maxLength: 255,
    })
    @IsEmail()
    @MaxLength(255)
    email!: string
}
