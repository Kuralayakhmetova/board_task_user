import { Injectable } from '@nestjs/common';
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



  async remove(id: number) {
    return await this.prismaService.board.delete({
      where: { id }
    });
  }
}
