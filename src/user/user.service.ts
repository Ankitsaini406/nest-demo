import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from './dto/users.dto.js';
import { join } from 'node:path';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';

export interface User {
    id: number;
    name: string;
    email: string;
}

@Injectable()
export class UserService {
    private readonly logger = new Logger(UserService.name);
    private readonly dataDirectory = join(process.cwd(), 'data');
    private readonly filePath = join(this.dataDirectory, 'users.json');
    private writeQueue: Promise<void> = Promise.resolve();

    private users: User[] = [];

    async onModuleInit(): Promise<void> {
        try {
            await mkdir(this.dataDirectory, { recursive: true });
            const data = await readFile(this.filePath, 'utf-8');
            this.users = JSON.parse(data) as User[];
            if (!Array.isArray(this.users)) {
                throw new Error('Invalid users.json format');
            }
            this.logger.log(`Loaded ${this.users.length} users from JSON file`);
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
                this.users = [];
                await this.saveUsers();

                this.logger.warn('users.json not found. Created a new JSON database.');
            }

            this.logger.error(
                'Failed to initialize user database',
                error instanceof Error ? error.stack : String(error),
            );

            throw error;
        }
    }

    private async saveUsers(): Promise<void> {
        const snapshot = JSON.stringify(this.users, null, 4);

        this.writeQueue = this.writeQueue
            .catch(() => undefined)
            .then(async () => {
                const tempFile = `${this.filePath}.tmp`;
                await writeFile(tempFile, snapshot, 'utf-8');
                await rename(tempFile, this.filePath);
            });

        await this.writeQueue;
    }

    findAllUsers(name?: string): User[] {
        const searchName = name?.trim().toLowerCase();

        if (!searchName) {
            return this.users;
        }

        return this.users.filter((user) =>
            user.name.toLowerCase().includes(searchName));
    };

    findOneUser(id: number): User {
        const user = this.users.find((user) => user.id === id);

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        return user;
    }

    async createUser(dto: CreateUserDto): Promise<User> {
        const emailExists = this.users.some((user) => 
            user.email.toLowerCase() === dto.email.toLowerCase());

        if (emailExists) {
            throw new Error('Email already exists');
        }

        const newId = this.users.length > 0 ? Math.max(...this.users.map((user) => user.id)) + 1 : 1;
        const newUser: User = { id: newId, ...dto };
        this.users.push(newUser);
        await this.saveUsers();
        this.logger.log(`User created successfully. ID: ${newUser.id}`);
        return newUser;
    }

    async updateUser(id: number, dto: UpdateUserDto): Promise<User> {
        const index = this.users.findIndex((user) => user.id === id);
        if (index === -1) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        if (dto.email && this.users.some((user) => user.id !== id && user.email.toLowerCase() === dto.email!.toLowerCase())) {
            throw new Error('Email already exists');
        }

        this.users[index] = { ...this.users[index], ...dto };
        await this.saveUsers();
        this.logger.log(`User updated successfully. ID: ${id}`);
        return this.users[index];
    }

    async deleteUser(id: number): Promise<User> {
        const index = this.users.findIndex((user) => user.id === id);
        if (index === -1) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        const [deletedUser] = this.users.splice(index, 1);
        await this.saveUsers();
        this.logger.log(`User deleted successfully. ID: ${id}`);
        return deletedUser;
    }
}
