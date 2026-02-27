import { IsInt, IsString, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateBoardDto {

  @IsString()
  @ApiProperty({ description: 'Название доски' })
  title: string;


}