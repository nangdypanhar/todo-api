import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTodoDto } from './dto/create-todo.dto.js';
import { UpdateTodoDto } from './dto/update-todo.dto.js';
import { Todo } from './entities/todo.entity.js';

@Injectable()
export class TodoService {
  constructor(
    @InjectRepository(Todo)
    private readonly todoRepository: Repository<Todo>,
  ) {}

  create(createTodoDto: CreateTodoDto, userId: number): Promise<Todo> {
    const todo = this.todoRepository.create({ ...createTodoDto, userId });
    return this.todoRepository.save(todo);
  }

  findAll(userId: number): Promise<Todo[]> {
    return this.todoRepository.find({ where: { userId } });
  }

  async findOne(id: number, userId: number): Promise<Todo> {
    const todo = await this.todoRepository.findOneBy({ id, userId });
    if (!todo) {
      throw new NotFoundException(`Todo #${id} not found`);
    }
    return todo;
  }

  async update(id: number, updateTodoDto: UpdateTodoDto, userId: number): Promise<Todo> {
    const todo = await this.findOne(id, userId);
    Object.assign(todo, { ...updateTodoDto, userId });
    return this.todoRepository.save(todo);
  }

  async remove(id: number, userId: number): Promise<Todo> {
    const todo = await this.findOne(id, userId);
    return this.todoRepository.remove(todo);
  }
}
