import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TodoService } from './todo.service.js';
import { Todo } from './entities/todo.entity.js';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TodoUpdatedEvent } from './todo-updated.event.js';

describe('TodoService', () => {
  let service: TodoService;
  let repo: { findOneBy: ReturnType<typeof vi.fn>; save: ReturnType<typeof vi.fn> };
  let emitter: { emit: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    repo = {
      findOneBy: vi.fn(),
      save: vi.fn(async (todo: Todo) => todo),
    };
    emitter = { emit: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodoService,
        { provide: getRepositoryToken(Todo), useValue: repo },
        { provide: EventEmitter2, useValue: emitter },
      ],
    }).compile();

    service = module.get<TodoService>(TodoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('update with only a title changes only the title and emits todo.updated', async () => {
    repo.findOneBy.mockResolvedValue({
      id: 1, title: 'Old', status: 'open', starred: true, userId: 7,
    });

    const result = await service.update(1, { title: 'Buy milk' }, 7);

    expect(result).toEqual({
      id: 1, title: 'Buy milk', status: 'open', starred: true, userId: 7,
    });
    expect(emitter.emit).toHaveBeenCalledWith(
      'todo.updated',
      new TodoUpdatedEvent(1, 'Buy milk', 'open', true, 7),
    );
  });

  it('update ignores fields the DTO carries as undefined', async () => {
    repo.findOneBy.mockResolvedValue({
      id: 1, title: 'Old', status: 'open', starred: true, userId: 7,
    });

    // This is what ValidationPipe hands over for a body of { "title": "Buy milk" }.
    const result = await service.update(
      1,
      { title: 'Buy milk', status: undefined, starred: undefined },
      7,
    );

    expect(result).toEqual({
      id: 1, title: 'Buy milk', status: 'open', starred: true, userId: 7,
    });
    expect(emitter.emit).toHaveBeenCalledWith(
      'todo.updated',
      new TodoUpdatedEvent(1, 'Buy milk', 'open', true, 7),
    );
  });
});
