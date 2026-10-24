import { Todo } from '../../domain';
import { TodoMapper } from './todo.mapper';
import { TodoOrmEntity } from './todo.orm-entity';

const record = (overrides: Partial<TodoOrmEntity> = {}) =>
	Object.assign(new TodoOrmEntity(), {
		id: 'id-1',
		isActive: false,
		title: 'Buy milk',
		description: '2 bottles',
		createdDate: new Date('2026-09-24T10:51:52.557Z'),
		createdBy: 'user-1',
		...overrides,
	});

describe('TodoMapper', () => {
	const mapper = new TodoMapper();

	it('toDomain should rebuild the aggregate from the record', () => {
		const todo = mapper.toDomain(record());

		expect(todo).toBeInstanceOf(Todo);
		expect(todo).toMatchObject({ id: 'id-1', isActive: false, description: '2 bottles' });
		expect(todo.title.value).toBe('Buy milk');
	});

	it('toDomain should trust stored values and not re-validate them', () => {
		expect(mapper.toDomain(record({ title: '  ' })).title.value).toBe('  ');
	});

	it('toDomain should keep a null description', () => {
		expect(mapper.toDomain(record({ description: null })).description).toBeNull();
	});

	it('toPersistence should map every domain field and leave audit columns undefined', () => {
		const todo = Todo.create({ title: 'Buy milk', description: '2 bottles' });

		const persisted = mapper.toPersistence(todo);

		expect(persisted).toBeInstanceOf(TodoOrmEntity);
		expect(persisted).toEqual(
			Object.assign(new TodoOrmEntity(), {
				id: todo.id,
				isActive: true,
				title: 'Buy milk',
				description: '2 bottles',
			}),
		);
		expect(persisted.createdDate).toBeUndefined();
		expect(persisted.createdBy).toBeUndefined();
		expect(persisted.updatedDate).toBeUndefined();
		expect(persisted.updatedBy).toBeUndefined();
		expect(persisted.deletedDate).toBeUndefined();
		expect(persisted.deletedBy).toBeUndefined();
	});

	it('should survive a round trip through persistence', () => {
		const todo = Todo.create({ title: 'Buy milk' });

		const restored = mapper.toDomain(mapper.toPersistence(todo));

		expect(restored.equals(todo)).toBe(true);
		expect(restored.title.value).toBe('Buy milk');
		expect(restored.description).toBeNull();
	});
});
