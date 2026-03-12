import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BoardsService {
    constructor(private readonly prismaService: PrismaService) {}
  
  async create(dto: CreateBoardDto) {
    return await this.prismaService.board.create({
      data: dto
    });
  }

  async findAll() {
    return await this.prismaService.board.findMany();
  }

  async findOne(id: number) {
    return await this.prismaService.board.findUnique({
      where: { id }
    });

  }

async findByBoardId(id: number) {
  return this.prismaService.board.findUnique({
    where: { id },
    include: {
      tasks: {
        include: {
          user: true,
        },
      },
    },
  });
}


async update(id: number, updateBoardDto: UpdateBoardDto) {
  const board = await this.prismaService.board.findUnique({
    where: { id },
  });

  if (!board) {
    throw new NotFoundException('Доска не найдена');
  }

  return this.prismaService.board.update({
    where: { id },
    data: updateBoardDto,
  });
}
  async remove(id: number) {
    return await this.prismaService.board.delete({
      where: { id }
    });
  }
}
