import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TodoService } from './todo.service.js';
import { CreateTodoDto } from './dto/create-todo.dto.js';
import { UpdateTodoDto } from './dto/update-todo.dto.js';
import { CurrentUser } from '../auth/decorator/current-user.decorator.js';
import type { AuthUser } from '../auth/jwt-strategy.js';

@Controller('todo')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Post()
  create(@Body() createTodoDto: CreateTodoDto, @CurrentUser() user: AuthUser) {
    return this.todoService.create(createTodoDto, user.id);
  }

  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.todoService.findAll(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.todoService.findOne(+id, user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTodoDto: UpdateTodoDto, @CurrentUser() user: AuthUser) {
    return this.todoService.update(+id, updateTodoDto, user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.todoService.remove(+id, user.id);
  }
}
