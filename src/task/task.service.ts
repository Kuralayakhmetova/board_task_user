import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Status } from '../auth/enums/status.enum';
import { Role } from '../auth/enums/role.enum';

@Injectable()
export class TaskService {
  constructor(private readonly prismaService: PrismaService) {}

  // Создание задачи
  async create(dto: CreateTaskDto, userId: number) {
    return this.prismaService.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        boardId: dto.boardId,      // из DTO
        status: dto.status ?? Status.TODO,
        userId,                    // только из JWT
      },
      include: { user: true, board: true },
    });
  }

  // Получение списка задач с фильтром по статусу
  async findAll(status?: Status) {
    return this.prismaService.task.findMany({
      where: status ? { status } : {},
      include: { user: true, board: true },
    });
  }

  // Получение задачи по ID
  async findById(id: number) {
    const task = await this.prismaService.task.findUnique({
      where: { id },
      include: { user: true, board: true },
    });

    if (!task) throw new NotFoundException('Задача не найдена');
    return task;
  }

  // Обновление задачи (только владелец или админ)
  async update(id: number, dto: UpdateTaskDto, userId: number, userRole: Role) {
    const task = await this.prismaService.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('Задача не найдена');

    if (task.userId !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('Доступ запрещен');
    }

    return this.prismaService.task.update({
      where: { id },
      data: {
        title: dto.title ?? task.title,
        description: dto.description ?? task.description,
        status: dto.status ?? task.status,
        boardId: dto.boardId ?? task.boardId,
      },
      include: { user: true, board: true },
    });
  }

  // Удаление задачи (только владелец или админ)
  async remove(id: number, userId: number, userRole: Role) {
    const task = await this.prismaService.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('Задача не найдена');

    if (task.userId !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('Доступ запрещен');
    }

    return this.prismaService.task.delete({ where: { id } });
  }
}