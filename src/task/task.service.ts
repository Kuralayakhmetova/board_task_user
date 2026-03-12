import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Status } from 'src/generated/prisma/browser';
import { Role } from 'src/auth/enums/role.enum';

@Injectable()
export class TaskService {
  constructor(private readonly prismaService: PrismaService) {}

  // Создание задачи — userId берём из JWT
  async create(dto: CreateTaskDto, userId: number) {
    return await this.prismaService.task.create({
      data: { ...dto, userId },
    });
  }

  // Получение списка задач с фильтром по статусу
  async findAll(status?: Status) {
    return await this.prismaService.task.findMany({
      where: status ? { status } : {},
    });
  }

  // Получение одной задачи (без пользователя)
  async findOne(id: number) {
    return this.prismaService.task.findUnique({
      where: { id },
    });
  }

  // Получение задачи с пользователем
  async findById(id: number) {
    const task = await this.prismaService.task.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!task) throw new NotFoundException('Задача не найдена');
    return task;
  }

  // Обновление задачи — проверка владения
  async update(
    id: number,
    dto: UpdateTaskDto,
    userId: number,
    userRole: Role,
  ) {
    const task = await this.prismaService.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('Задача не найдена');

    if (task.userId !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException(
        'Вы не можете изменять чужие задачи',
      );
    }

    return this.prismaService.task.update({
      where: { id },
      data: dto,
    });
  }

  // Удаление задачи — проверка владения
  async remove(
    id: number,
    userId: number,
    userRole: Role,
  ) {
    const task = await this.prismaService.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('Задача не найдена');

    if (task.userId !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException(
        'Вы не можете удалять чужие задачи',
      );
    }

    return this.prismaService.task.delete({
      where: { id },
    });
  }
}