import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(dto: CreateUserDto) {
    return await this.prismaService.user.create({
      data: dto
    });
  }

  async getProfileWithTasks(userId: number) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        tasks: true, // include задачи
      },
    });

    if (!user) throw new NotFoundException('Пользователь не найден');

    return user;
  }

  async getCurrentUser(userId: number) {
  return this.prismaService.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      tasks: true, // список задач пользователя
    },
  });
}

  async findAll() {
    return await this.prismaService.user.findMany();
  }




async findByUserId(id: number) {
  return await this.prismaService.user.findUnique({
    where: { id },
    include: {
      tasks: {
        include: { board: true }, // чтобы задачи сразу содержали доску
      },
    },
  });
}

  async remove(id: number) {
    return await this.prismaService.user.delete({
      where: { id },
    });
  }
}
