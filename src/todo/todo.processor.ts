import { Logger } from '@nestjs/common';
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { SEND_REMINDER_JOB, SendReminderJobData, TODO_QUEUE } from './todo-queue.js';

@Processor(TODO_QUEUE)
export class TodoProcessor extends WorkerHost {
  private readonly logger = new Logger(TodoProcessor.name);

  async process(job: Job<SendReminderJobData>): Promise<void> {
    if (job.name !== SEND_REMINDER_JOB) {
      this.logger.warn(`Unknown job "${job.name}" (id ${job.id}), skipping`);
      return;
    }

    const { todoId, title, userId } = job.data;
    this.logger.log(
      `Reminder for user ${userId}: todo ${todoId} "${title}" (job ${job.id}, attempt ${job.attemptsMade + 1})`,
    );
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<SendReminderJobData>, error: Error) {
    this.logger.warn(
      `Job ${job.id} attempt ${job.attemptsMade} failed: ${error.message}`,
    );
  }
}
