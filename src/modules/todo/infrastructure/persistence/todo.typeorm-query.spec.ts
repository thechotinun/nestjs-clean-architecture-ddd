import type { Repository } from 'typeorm';
import { TodoOrmEntity } from './todo.orm-entity';
import { TodoTypeOrmQueryService } from './todo.typeorm-query';

describe('TodoTypeOrmQueryService', () => {
	let orm: jest.Mocked<Repository<TodoOrmEntity>>;
	let query: TodoTypeOrmQueryService;

	const date = new Date('2026-09-24T10:51:52.557Z');
	const record = (overrides: Partial<TodoOrmEntity> = {}) =>
		Object.assign(new TodoOrmEntity(), {
			id: 'id-1',
			isActive: true,
			title: 'Buy milk',
			description: '2 bottles',
			createdDate: date,
			createdBy: 'user-1',
			updatedDate: date,
			updatedBy: null,
			deletedDate: null,
			deletedBy: null,
			...overrides,
		});

	beforeEach(() => {
		orm = {
			findOne: jest.fn(),
			findAndCount: jest.fn(),
		} as unknown as jest.Mocked<Repository<TodoOrmEntity>>;
		query = new TodoTypeOrmQueryService(orm);
	});

	it('should map the record to a view with todo fields and audit fields', async () => {
		orm.findOne.mockResolvedValue(record());

		await expect(query.findById('id-1')).resolves.toEqual({
			id: 'id-1',
			isActive: true,
			createdDate: date,
			createdBy: 'user-1',
			updatedDate: date,
			updatedBy: null,
			deletedDate: null,
			deletedBy: null,
			title: 'Buy milk',
			description: '2 bottles',
		});
	});

	it('should turn a missing description into null, never undefined', async () => {
		orm.findOne.mockResolvedValue(
			record({ description: undefined as unknown as TodoOrmEntity['description'] }),
		);

		await expect(query.findById('id-1')).resolves.toHaveProperty('description', null);
	});

	it('should map every record of a page', async () => {
		orm.findAndCount.mockResolvedValue([[record(), record({ id: 'id-2', title: 'B' })], 2]);

		const page = await query.findAll({ page: 1, perPage: 10 });

		expect(page.totalItems).toBe(2);
		expect(page.items.map((v) => [v.id, v.title])).toEqual([
			['id-1', 'Buy milk'],
			['id-2', 'B'],
		]);
	});
});
