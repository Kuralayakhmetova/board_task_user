import { Injectable } from '@nestjs/common';
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
