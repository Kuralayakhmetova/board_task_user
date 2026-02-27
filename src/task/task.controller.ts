import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import {ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Status } from 'src/generated/prisma/browser';

@ApiTags('Tasks')
@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @ApiOperation({ summary: 'Создание новой задачи' })
  @ApiResponse({ status: 201, description: 'Задача успешно создана.' })
  @ApiResponse({ status: 400, description: 'Некорректные данные.' })
  @Post()
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.taskService.create(createTaskDto);
  }

  @ApiOperation({ summary: 'Получить список всех задач' })
   @ApiQuery({ name: 'status', required: false, enum: Status, description: 'Фильтр по статусу задачи' })

  @ApiResponse({ status: 200, description: 'Список задач успешно получен.' })
  @ApiResponse({ status: 400, description: 'Некорректные данные.' })
/*   @Get()
  findAll() {
    return this.taskService.findAll();
  } */

@Get()
findAll(@Query('status') status?: Status) {
  return this.taskService.findAll(status);
}

  @ApiOperation({ summary: 'Получить задачу с пользователем'})
  @ApiResponse({ status: 200, description: 'Задача успешно получена.' })
  @ApiResponse({ status: 404, description: 'Задача не найдена.' })
 
  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.taskService.findById(id);
  }



@ApiOperation({ summary: 'Удалить задачу по ID' })
@ApiResponse({ status: 200, description: 'Задача успешно удалена.' })
@ApiResponse({ status: 404, description: 'Задача не найдена.' })
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.taskService.remove(id);
  }
}
