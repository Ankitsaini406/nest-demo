import { PartialType } from '@nestjs/mapped-types';

export class CreateUserDto {
    name: string;
    email: string;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}