import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { TodoCreatedEvent } from '../todo-created.event.js';
import { TodoUpdatedEvent } from '../todo-updated.event.js';

@Injectable()
export class TodoNotificationsListener {
  private readonly logger = new Logger(TodoNotificationsListener.name);

  @OnEvent('todo.created')
  handleTodoCreated(event: TodoCreatedEvent) {
    this.logger.log(
      `Todo ${event.todoId} created: "${event.title}" (user ${event.userId})`,
    );
  }

  @OnEvent('todo.updated')
  handleTodoUpdated(event: TodoUpdatedEvent) {
    this.logger.log(
      `Todo ${event.todoId} updated: "${event.title}", status: ${event.status}, starred: ${event.starred}`,
    );
  }
}
