import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TodoService } from './todo.service.js';
import { TodoController } from './todo.controller.js';
import { Todo } from './entities/todo.entity.js';
import { TodoNotificationsListener } from './listeners/todo-notifications.listener.js';
import { TodoStatsListener } from './listeners/todo-stats.listener.js';

@Module({
  imports: [TypeOrmModule.forFeature([Todo])],
  controllers: [TodoController],
  providers: [TodoService, TodoNotificationsListener, TodoStatsListener],
})
export class TodoModule {}
