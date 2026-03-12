import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Status } from 'src/generated/prisma/browser';
import { Authorized } from 'src/auth/decorators/authorized.decorator';
import { Role } from 'src/auth/enums/role.enum';

@ApiTags('Tasks')
@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  @ApiOperation({ summary: 'Создание новой задачи' })
  @ApiResponse({ status: 201, description: 'Задача успешно создана.' })
  @ApiResponse({ status: 400, description: 'Некорректные данные.' })
  create(
    @Body() dto: CreateTaskDto,
    @Authorized('id') userId: number, // из JWT
  ) {
    return this.taskService.create(dto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Получить список всех задач' })
  @ApiQuery({ name: 'status', required: false, enum: Status, description: 'Фильтр по статусу задачи' })
  @ApiResponse({ status: 200, description: 'Список задач успешно получен.' })
  findAll(@Query('status') status?: Status) {
    return this.taskService.findAll(status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить задачу с пользователем' })
  @ApiResponse({ status: 200, description: 'Задача успешно получена.' })
  @ApiResponse({ status: 404, description: 'Задача не найдена.' })
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.taskService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить задачу' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTaskDto,
    @Authorized('id') userId: number,
    @Authorized('role') userRole: Role,
  ) {
    return this.taskService.update(id, dto, userId, userRole);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить задачу по ID' })
  @ApiResponse({ status: 200, description: 'Задача успешно удалена.' })
  @ApiResponse({ status: 404, description: 'Задача не найдена.' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Authorized('id') userId: number,
    @Authorized('role') userRole: Role,
  ) {
    return this.taskService.remove(id, userId, userRole);
  }
}