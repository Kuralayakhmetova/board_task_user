import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Authorized } from 'src/auth/decorators/authorized.decorator';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Создать нового пользователя' })
  @ApiResponse({ status: 201, description: 'Пользователь успешно создан.' })
  @ApiResponse({ status: 400, description: 'Некорректные данные.' })
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @ApiOperation({ summary: 'Получить список всех пользователей' })
  @ApiResponse({ status: 200, description: 'Список пользователей успешно получен.' })
  @ApiResponse({ status: 400, description: 'Некорректные данные.' })
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // ⭐ GET /users/me — профиль текущего пользователя с задачами
  @ApiOperation({ summary: 'Получить профиль текущего пользователя с задачами' })
  @ApiResponse({ status: 200, description: 'Профиль успешно получен.' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден.' })
  @Get('me')
  getMe(@Authorized('id') userId: string) {
    return this.usersService.getProfileWithTasks(Number(userId));
  }

  @ApiOperation({ summary: 'Получить пользователя с его задачами по ID' })
  @ApiResponse({ status: 200, description: 'Пользователь успешно получен.' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден.' })
  @Get(':id')
  findByUserId(@Param('id') id: string) {
    return this.usersService.findByUserId(Number(id));
  }

  @ApiOperation({ summary: 'Удалить пользователя по ID' })
  @ApiResponse({ status: 200, description: 'Пользователь успешно удалён.' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден.' })
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.usersService.remove(id);
  }
}