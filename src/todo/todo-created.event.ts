export class TodoCreatedEvent {
  constructor(
    public readonly todoId: number,
    public readonly title: string,
    public readonly userId: number,
  ) {}
}