import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { TodoService } from './todo.service.js';
import { TodoController } from './todo.controller.js';
import { Todo } from './entities/todo.entity.js';
import { TodoNotificationsListener } from './listeners/todo-notifications.listener.js';
import { TodoStatsListener } from './listeners/todo-stats.listener.js';
import { TodoProcessor } from './todo.processor.js';
import { TODO_QUEUE } from './todo-queue.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Todo]),
    // Registered here (not in AppModule) so this module's listener can inject the queue.
    BullModule.registerQueue({ name: TODO_QUEUE }),
  ],
  controllers: [TodoController],
  providers: [TodoService, TodoNotificationsListener, TodoStatsListener, TodoProcessor],
})
export class TodoModule {}
