import { IsInt, IsString, Min, Max } from 'class-validator';

export class CreateBoardDto {
  @IsString()
  title: string;


}