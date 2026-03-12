import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Role } from 'src/auth/enums/role.enum';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.decorator';

@ApiTags('Boards')
@Controller('boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  // ADMIN
  @UseGuards(JwtGuard,RolesGuard) // только ADMIN может создавать доски
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Создание новой доски' })
  @ApiResponse({ status: 201, description: 'Доска успешно создана.' })
  @Post()
  create(@Body() createBoardDto: CreateBoardDto) {
    return this.boardsService.create(createBoardDto);
  }

  // любой авторизованный
  @ApiOperation({ summary: 'Получить список всех досок' })
  @ApiResponse({ status: 200, description: 'Список досок успешно получен.' })
  @Get()
  findAll() {
    return this.boardsService.findAll();
  }

  // любой авторизованный

  @ApiOperation({ summary: 'Получить доску по ID' })
  @ApiResponse({ status: 200, description: 'Доска успешно получена.' })
  @ApiResponse({ status: 404, description: 'Доска не найдена.' })
  
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.boardsService.findOne(id);
  }

  // ADMIN
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Обновить доску' })
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBoardDto: UpdateBoardDto,
  ) {
    return this.boardsService.update(id, updateBoardDto);
  }

  // ADMIN
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Удалить доску по ID' })
  @ApiResponse({ status: 200, description: 'Доска успешно удалена.' })
  @ApiResponse({ status: 404, description: 'Доска не найдена.' })
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.boardsService.remove(id);
  }
}