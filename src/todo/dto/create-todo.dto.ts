import { ApiProperty } from '@nestjs/swagger';

export class CreateTodoDto {
    @ApiProperty({ example: 'Learn NestJS' })
    title: string;

    @ApiProperty({ example: 'open' })
    status: string;

    @ApiProperty({ example: false })
    starred: boolean;
}
