import { PermissionOrmEntity } from '@/modules/permission/infrastructure/persistence/permission.orm-entity';
import { Role } from '../../domain';
import { RoleMapper } from './role.mapper';
import { RoleOrmEntity } from './role.orm-entity';

const record = (overrides: Partial<RoleOrmEntity> = {}) =>
	Object.assign(new RoleOrmEntity(), {
		id: 'id-1',
		isActive: false,
		name: 'Admin',
		description: 'Full access',
		createdDate: new Date('2026-09-24T10:51:52.557Z'),
		createdBy: 'user-1',
		...overrides,
	});

describe('RoleMapper', () => {
	const mapper = new RoleMapper();

	it('toDomain should rebuild the aggregate from the record', () => {
		const role = mapper.toDomain(record());

		expect(role).toBeInstanceOf(Role);
		expect(role).toMatchObject({ id: 'id-1', isActive: false, description: 'Full access' });
		expect(role.name.value).toBe('Admin');
	});

	it('toDomain should trust stored values and not re-validate them', () => {
		expect(mapper.toDomain(record({ name: '  ' })).name.value).toBe('  ');
	});

	it('toDomain should keep a null description', () => {
		expect(mapper.toDomain(record({ description: null })).description).toBeNull();
	});

	it('toPersistence should map every domain field and leave audit columns undefined', () => {
		const role = Role.create({ name: 'Admin', description: 'Full access' });

		const persisted = mapper.toPersistence(role);

		expect(persisted).toBeInstanceOf(RoleOrmEntity);
		expect(persisted).toEqual(
			Object.assign(new RoleOrmEntity(), {
				id: role.id,
				isActive: true,
				name: 'Admin',
				description: 'Full access',
				permissions: [],
			}),
		);
		expect(persisted.createdDate).toBeUndefined();
		expect(persisted.createdBy).toBeUndefined();
		expect(persisted.updatedDate).toBeUndefined();
		expect(persisted.updatedBy).toBeUndefined();
		expect(persisted.deletedDate).toBeUndefined();
		expect(persisted.deletedBy).toBeUndefined();
	});

	it('toDomain should collect the linked permission ids and tolerate unloaded links', () => {
		const linked = [{ id: 'p1' }, { id: 'p2' }].map((p) =>
			Object.assign(new PermissionOrmEntity(), p),
		);

		expect([...mapper.toDomain(record({ permissions: linked })).permissionIds]).toEqual([
			'p1',
			'p2',
		]);
		expect(mapper.toDomain(record()).permissionIds.size).toBe(0);
	});

	it('toPersistence should send id-only permission stubs so an empty set clears the links', () => {
		const role = Role.create({ name: 'Admin' });
		role.setPermissions(['p1', 'p2']);

		const persisted = mapper.toPersistence(role);

		expect(persisted.permissions).toEqual([{ id: 'p1' }, { id: 'p2' }]);
		expect(persisted.permissions![0]).toBeInstanceOf(PermissionOrmEntity);
	});

	it('should survive a round trip through persistence', () => {
		const role = Role.create({ name: 'Admin' });
		role.setPermissions(['p1']);

		const restored = mapper.toDomain(mapper.toPersistence(role));

		expect(restored.equals(role)).toBe(true);
		expect([...restored.permissionIds]).toEqual(['p1']);
		expect(restored.name.value).toBe('Admin');
		expect(restored.description).toBeNull();
	});
});
