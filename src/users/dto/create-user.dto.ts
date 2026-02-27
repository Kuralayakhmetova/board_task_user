
import { Min, MinLength,IsEmail ,IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({example: 'John Doe'  })
  @IsString()  
  @MinLength(2)
  name: string;
}