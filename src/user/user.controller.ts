import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { User, UserService } from './user.service.js';
import { CreateUserDto, UpdateUserDto } from './dto/users.dto.js';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Get()
    getUser(@Query('name') name: string): User[] {
        return this.userService.findAllUsers(name);
    }

    @Get(':id')
    getUserById(@Param('id') id: number): User[] {
        return this.userService.findOneUser(Number(id));
    }

    @Post()
    createUser(@Body() createUserDto: CreateUserDto) {
        return this.userService.createUser(createUserDto)
    }

    @Put(':id')
    updateUser(@Param(':id') id: number, @Body() updateUserDto: UpdateUserDto) {
        return this.userService.updateUser(Number(id), updateUserDto);
    }

    @Delete(':id')
    deleteUser(@Param(':id') id: number) {
        return this.userService.deleteUser(Number(id));
    }
}
