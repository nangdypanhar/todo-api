import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { TodoCreatedEvent } from '../todo-created.event.js';
import { TodoUpdatedEvent } from '../todo-updated.event.js';
import {
  REMINDER_DELAY_MS,
  SEND_REMINDER_JOB,
  SendReminderJobData,
  TODO_QUEUE,
} from '../todo-queue.js';

@Injectable()
export class TodoNotificationsListener {
  private readonly logger = new Logger(TodoNotificationsListener.name);

  constructor(
    @InjectQueue(TODO_QUEUE) private readonly todoQueue: Queue<SendReminderJobData>,
  ) {}

  @OnEvent('todo.created')
  async handleTodoCreated(event: TodoCreatedEvent) {
    this.logger.log(
      `Todo ${event.todoId} created: "${event.title}" (user ${event.userId})`,
    );

    const job = await this.todoQueue.add(
      SEND_REMINDER_JOB,
      { todoId: event.todoId, title: event.title, userId: event.userId },
      {
        delay: REMINDER_DELAY_MS,
        attempts: 3,
        backoff: { type: 'fixed', delay: 2_000 },
        removeOnComplete: true,
      },
    );
    this.logger.log(
      `Queued reminder job ${job.id} for todo ${event.todoId} (runs in ${REMINDER_DELAY_MS / 1000}s)`,
    );
  }

  @OnEvent('todo.updated')
  handleTodoUpdated(event: TodoUpdatedEvent) {
    this.logger.log(
      `Todo ${event.todoId} updated: "${event.title}", status: ${event.status}, starred: ${event.starred}`,
    );
  }
}
