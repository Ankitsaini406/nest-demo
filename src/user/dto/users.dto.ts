import { PartialType } from '@nestjs/mapped-types';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
    @IsString()
    @MinLength(3)
    name!: string;

    @IsEmail()
    email!: string;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}