import type { Repository } from 'typeorm';
import { PermissionOrmEntity } from './permission.orm-entity';
import { PermissionTypeOrmQueryService } from './permission.typeorm-query';

describe('PermissionTypeOrmQueryService', () => {
	let orm: jest.Mocked<Repository<PermissionOrmEntity>>;
	let query: PermissionTypeOrmQueryService;

	const date = new Date('2026-09-24T10:51:52.557Z');
	const record = (overrides: Partial<PermissionOrmEntity> = {}) =>
		Object.assign(new PermissionOrmEntity(), {
			id: 'id-1',
			isActive: true,
			name: 'Create todo',
			description: 'Can create todos',
			resource: 'todo',
			action: 'create',
			isGlobal: true,
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
		} as unknown as jest.Mocked<Repository<PermissionOrmEntity>>;
		query = new PermissionTypeOrmQueryService(orm);
	});

	it('should map the record to a view with permission fields and audit fields', async () => {
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
			name: 'Create todo',
			description: 'Can create todos',
			resource: 'todo',
			action: 'create',
			isGlobal: true,
		});
	});

	it('should expose isGlobal false as false, not drop it', async () => {
		orm.findOne.mockResolvedValue(record({ isGlobal: false }));

		await expect(query.findById('id-1')).resolves.toHaveProperty('isGlobal', false);
	});

	it('should turn a missing description into null, never undefined', async () => {
		orm.findOne.mockResolvedValue(
			record({ description: undefined as unknown as PermissionOrmEntity['description'] }),
		);

		await expect(query.findById('id-1')).resolves.toHaveProperty('description', null);
	});

	it('should map every record of a page', async () => {
		orm.findAndCount.mockResolvedValue([
			[record(), record({ id: 'id-2', resource: 'role', action: 'read', isGlobal: false })],
			2,
		]);

		const page = await query.findAll({ page: 1, perPage: 10 });

		expect(page.totalItems).toBe(2);
		expect(page.items.map((v) => [v.id, v.resource, v.action, v.isGlobal])).toEqual([
			['id-1', 'todo', 'create', true],
			['id-2', 'role', 'read', false],
		]);
	});
});
