import type { Repository } from 'typeorm';
import { RoleOrmEntity } from './role.orm-entity';
import { RoleTypeOrmQueryService } from './role.typeorm-query';

describe('RoleTypeOrmQueryService', () => {
	let orm: jest.Mocked<Repository<RoleOrmEntity>>;
	let query: RoleTypeOrmQueryService;

	const date = new Date('2026-09-24T10:51:52.557Z');
	const record = (overrides: Partial<RoleOrmEntity> = {}) =>
		Object.assign(new RoleOrmEntity(), {
			id: 'id-1',
			isActive: true,
			name: 'Admin',
			description: 'Full access',
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
		} as unknown as jest.Mocked<Repository<RoleOrmEntity>>;
		query = new RoleTypeOrmQueryService(orm);
	});

	it('should map the record to a view with role fields and audit fields', async () => {
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
			name: 'Admin',
			description: 'Full access',
		});
	});

	it('should turn a missing description into null, never undefined', async () => {
		orm.findOne.mockResolvedValue(
			record({ description: undefined as unknown as RoleOrmEntity['description'] }),
		);

		await expect(query.findById('id-1')).resolves.toHaveProperty('description', null);
	});

	it('should map every record of a page', async () => {
		orm.findAndCount.mockResolvedValue([[record(), record({ id: 'id-2', name: 'B' })], 2]);

		const page = await query.findAll({ page: 1, perPage: 10 });

		expect(page.totalItems).toBe(2);
		expect(page.items.map((v) => [v.id, v.name])).toEqual([
			['id-1', 'Admin'],
			['id-2', 'B'],
		]);
	});
});
