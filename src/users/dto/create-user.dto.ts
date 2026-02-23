
import { Min, MinLength,IsEmail ,IsString } from "class-validator";


export class CreateUserDto {
  @IsEmail()
  email: string;
  
  @IsString()  
  @MinLength(2)
  name: string;
}