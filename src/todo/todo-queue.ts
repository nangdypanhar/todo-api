export const TODO_QUEUE = 'tasks';
export const SEND_REMINDER_JOB = 'send-reminder';

// While testing the reminder runs 5 seconds after the todo is created.
export const REMINDER_DELAY_MS = 5_000;

export interface SendReminderJobData {
  todoId: number;
  title: string;
  userId: number;
}
