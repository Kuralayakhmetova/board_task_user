import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Status } from 'src/generated/prisma/browser';

@Injectable()
export class TaskService {
  constructor(private readonly prismaService: PrismaService) {}
  async create(dto: CreateTaskDto) {
    return await this.prismaService.task.create({
      data: dto
    });
  }

/*   async findAll() {
    return await this.prismaService.task.findMany();
  }
 */
async findAll(status?: Status) {
  return await this.prismaService.task.findMany({
    where: status ? { status } : {},
  });
}

async findOne(id: number) {
  return this.prismaService.task.findUnique({
    where: { id },
  });
}
async findById(id: number) {
  const task = await this.prismaService.task.findUnique({
    where: { id },
    include: {
    user: true,
    },
  });

  if (!task) {
    throw new NotFoundException('Задача не найдена');
  }

  return task;
}


async remove(id: number) {
  return this.prismaService.task.delete({
    where: { id },
  });
}}