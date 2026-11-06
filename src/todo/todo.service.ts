import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTodoDto } from './dto/create-todo.dto.js';
import { UpdateTodoDto } from './dto/update-todo.dto.js';
import { Todo } from './entities/todo.entity.js';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TodoCreatedEvent } from './todo-created.event.js';
import { TodoUpdatedEvent } from './todo-updated.event.js';

@Injectable()
export class TodoService {
  constructor(
    @InjectRepository(Todo)
    private readonly todoRepository: Repository<Todo>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

 async create(
  createTodoDto: CreateTodoDto,
  userId: number,
): Promise<Todo> {
  const todo = await this.todoRepository.save({...createTodoDto,userId});

  this.eventEmitter.emit(
    'todo.created',
    new TodoCreatedEvent(todo.id, todo.title, userId),
  );

  return todo;
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

  async update(id: number, changes: UpdateTodoDto, userId: number): Promise<Todo> {
    const todo = await this.findOne(id, userId);
    // Fields that weren't sent arrive as undefined on the DTO; skip them so they don't wipe existing values.
    const sent = Object.fromEntries(
      Object.entries(changes).filter(([, value]) => value !== undefined),
    );
    Object.assign(todo, sent);
    const saved = await this.todoRepository.save(todo);

    this.eventEmitter.emit(
      'todo.updated',
      new TodoUpdatedEvent(saved.id, saved.title, saved.status, saved.starred, userId),
    );

    return saved;
  }

  async remove(id: number, userId: number): Promise<Todo> {
    const todo = await this.findOne(id, userId);
    return this.todoRepository.remove(todo);
  }
}
