import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Boards')
@Controller('boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @ApiOperation({ summary: 'Создание новой доски' })
  @ApiResponse({ status: 201, description: 'Доска успешно создана.' })
  @ApiResponse({ status: 400, description: 'Некорректные данные.' })
  @Post()
  create(@Body() createBoardDto: CreateBoardDto) {
    return this.boardsService.create(createBoardDto);
  }

  @ApiOperation({ summary: 'Получить список всех досок' })
  @ApiResponse({ status: 200, description: 'Список досок успешно получен.' })
  @ApiResponse({ status: 400, description: 'Некорректные данные.' })  
  @Get()
  findAll() {
    return this.boardsService.findAll();
  }

    @ApiOperation({ summary: 'Получить доску с задачами' })
    @ApiResponse({ status: 200, description: 'Задачи успешно получены.' })
    @ApiResponse({ status: 404, description: 'Доска не найдена.' }) 
@Get(':id')
findByBoardId(@Param('id', ParseIntPipe) id: number) {
  return this.boardsService.findByBoardId(id);
}

@ApiOperation ({ summary: 'Получить доску по ID' })
@ApiResponse({ status: 200, description: 'Доска успешно получена.' })
@ApiResponse({ status: 404, description: 'Доска не найдена.' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.boardsService.findOne(+id);
  }


@ApiOperation({ summary: 'Удалить доску по ID' })
@ApiResponse({ status: 200, description: 'Доска успешно удалена.' })
@ApiResponse({ status: 404, description: 'Доска не найдена.' }) 
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.boardsService.remove(+id);
  }
}
