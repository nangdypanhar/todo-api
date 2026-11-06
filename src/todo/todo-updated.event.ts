export class TodoUpdatedEvent {
  constructor(
    public readonly todoId: number,
    public readonly title: string,
    public readonly status: string,
    public readonly starred: boolean,
    public readonly userId: number,
  ) {}
}
