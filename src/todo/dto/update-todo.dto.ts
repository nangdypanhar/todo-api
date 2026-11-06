import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateTodoDto {
  @ApiPropertyOptional({ example: 'Buy milk' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @ApiPropertyOptional({ example: 'done' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  status?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  starred?: boolean;
}
