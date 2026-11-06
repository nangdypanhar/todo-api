import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { TodoCreatedEvent } from '../todo-created.event.js';
import { TodoUpdatedEvent } from '../todo-updated.event.js';

export const DONE_STATUS = 'done';

@Injectable()
export class TodoStatsListener {
  private readonly logger = new Logger(TodoStatsListener.name);
  private createdCount = 0;
  // Ids of todos currently marked done, so repeated PATCHes aren't double counted.
  private readonly doneIds = new Set<number>();

  @OnEvent('todo.created')
  handleTodoCreated(_event: TodoCreatedEvent) {
    this.createdCount++;
    this.logger.log(`Todos created so far: ${this.createdCount}`);  }

  @OnEvent('todo.updated')
  handleTodoUpdated(event: TodoUpdatedEvent) {
    if (event.status === DONE_STATUS) {
      this.doneIds.add(event.todoId);
    } else {
      this.doneIds.delete(event.todoId);
    }
    this.logger.log(`Todos marked done: ${this.doneIds.size}`);
  }

  get stats() {
    return { created: this.createdCount, done: this.doneIds.size };
  }
}
