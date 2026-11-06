import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TodoService } from './todo.service.js';
import { Todo } from './entities/todo.entity.js';
import { TodoCreatedEvent } from './todo-created.event.js';
import { TodoUpdatedEvent } from './todo-updated.event.js';

// Unit tests: the repository and event emitter are mocks, so no database is touched.
describe('TodoService', () => {
  let service: TodoService;
  let repo: {
    save: ReturnType<typeof vi.fn>;
    findOneBy: ReturnType<typeof vi.fn>;
  };
  let emitter: { emit: ReturnType<typeof vi.fn> };

  const existing = (): Todo =>
    ({ id: 1, title: 'Old', status: 'open', starred: true, userId: 7 }) as Todo;

  beforeEach(async () => {
    repo = {
      save: vi.fn(async (todo) => ({ id: 1, ...todo })),
      findOneBy: vi.fn(),
    };
    emitter = { emit: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodoService,
        { provide: getRepositoryToken(Todo), useValue: repo },
        { provide: EventEmitter2, useValue: emitter },
      ],
    }).compile();

    service = module.get(TodoService);
  });

  it('create saves the todo for the user and emits todo.created', async () => {
    const result = await service.create(
      { title: 'Buy milk', status: 'open', starred: false },
      7,
    );

    expect(repo.save).toHaveBeenCalledWith({
      title: 'Buy milk', status: 'open', starred: false, userId: 7,
    });
    expect(result).toEqual({
      id: 1, title: 'Buy milk', status: 'open', starred: false, userId: 7,
    });
    expect(emitter.emit).toHaveBeenCalledWith(
      'todo.created',
      new TodoCreatedEvent(1, 'Buy milk', 7),
    );
  });

  it('findOne returns the todo when it belongs to the user', async () => {
    repo.findOneBy.mockResolvedValue(existing());

    await expect(service.findOne(1, 7)).resolves.toEqual(existing());
    expect(repo.findOneBy).toHaveBeenCalledWith({ id: 1, userId: 7 });
  });

  it('findOne throws NotFoundException when the todo does not exist', async () => {
    repo.findOneBy.mockResolvedValue(null);

    await expect(service.findOne(99, 7)).rejects.toThrow(NotFoundException);
  });

  it('update throws NotFoundException for a missing todo and saves nothing', async () => {
    repo.findOneBy.mockResolvedValue(null);

    await expect(service.update(99, { title: 'Buy milk' }, 7)).rejects.toThrow(
      NotFoundException,
    );
    expect(repo.save).not.toHaveBeenCalled();
    expect(emitter.emit).not.toHaveBeenCalled();
  });

  it('update with only a title changes only the title and emits todo.updated', async () => {
    repo.findOneBy.mockResolvedValue(existing());
    repo.save.mockImplementation(async (todo) => todo);

    // Fields that weren't sent arrive as undefined from ValidationPipe.
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
