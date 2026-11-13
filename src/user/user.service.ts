import { Injectable } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from './dto/users.dto.js';

export interface User {
    id: number;
    name: string;
    email: string;
}

@Injectable()
export class UserService {

    private users: User[] = [
        { id: 1, name: 'John Doe', email: 'johndoe@gmail.com' },
        { id: 2, name: 'Alice', email: 'alice@gmail.com' }
    ];

    findAllUsers(name: string = '') {
        return this.users.filter((user) => user.name.toLowerCase().includes(name.toLowerCase()));
    };

    findOneUser(id: number) {
        return this.users.filter((user) => user.id === id) ?? null;
    }

    createUser(dto: CreateUserDto) {
        const newUser: User = { id: this.users.length + 1, ...dto };
        this.users.push(newUser);

        return newUser;
    }

    updateUser(id: number, dto: UpdateUserDto) {
        const index = this.users.findIndex((user) => user.id === id);
        if (index === -1) return null;

        this.users[index] = { ...this.users[index], ...dto };

        return this.users[index];
    }

    deleteUser(id: number) {
        const index = this.users.findIndex((user) => user.id === id);
        if (index === -1) return null;

        const [deleted] = this.users.splice(index, 1);

        return deleted;
    }
}
