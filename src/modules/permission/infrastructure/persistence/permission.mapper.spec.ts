import { Permission } from '../../domain';
import { PermissionMapper } from './permission.mapper';
import { PermissionOrmEntity } from './permission.orm-entity';

const record = (overrides: Partial<PermissionOrmEntity> = {}) =>
	Object.assign(new PermissionOrmEntity(), {
		id: 'id-1',
		isActive: false,
		name: 'Create todo',
		description: 'Can create todos',
		resource: 'todo',
		action: 'create',
		isGlobal: true,
		createdDate: new Date('2026-09-24T10:51:52.557Z'),
		createdBy: 'user-1',
		...overrides,
	});

describe('PermissionMapper', () => {
	const mapper = new PermissionMapper();

	it('toDomain should rebuild the aggregate from the record', () => {
		const permission = mapper.toDomain(record());

		expect(permission).toBeInstanceOf(Permission);
		expect(permission).toMatchObject({
			id: 'id-1',
			isActive: false,
			description: 'Can create todos',
			isGlobal: true,
		});
		expect(permission.name.value).toBe('Create todo');
		expect(permission.resource.value).toBe('todo');
		expect(permission.action.value).toBe('create');
	});

	it('toDomain should map isGlobal both ways', () => {
		expect(mapper.toDomain(record({ isGlobal: true })).isGlobal).toBe(true);
		expect(mapper.toDomain(record({ isGlobal: false })).isGlobal).toBe(false);
	});

	it('toDomain should trust stored values and not re-validate or normalize them', () => {
		const permission = mapper.toDomain(record({ name: '  ', resource: ' Todo ', action: '' }));

		expect(permission.name.value).toBe('  ');
		expect(permission.resource.value).toBe(' Todo ');
		expect(permission.action.value).toBe('');
	});

	it('toDomain should keep a null description', () => {
		expect(mapper.toDomain(record({ description: null })).description).toBeNull();
	});

	it('toPersistence should map every domain field and leave audit columns undefined', () => {
		const permission = Permission.create({
			name: 'Create todo',
			description: 'Can create todos',
			resource: 'Todo',
			action: 'CREATE',
			isGlobal: true,
		});

		const persisted = mapper.toPersistence(permission);

		expect(persisted).toBeInstanceOf(PermissionOrmEntity);
		expect(persisted).toEqual(
			Object.assign(new PermissionOrmEntity(), {
				id: permission.id,
				isActive: true,
				name: 'Create todo',
				description: 'Can create todos',
				resource: 'todo',
				action: 'create',
				isGlobal: true,
			}),
		);
		expect(persisted.createdDate).toBeUndefined();
		expect(persisted.createdBy).toBeUndefined();
		expect(persisted.updatedDate).toBeUndefined();
		expect(persisted.updatedBy).toBeUndefined();
		expect(persisted.deletedDate).toBeUndefined();
		expect(persisted.deletedBy).toBeUndefined();
	});

	it('toPersistence should write isGlobal false explicitly, not leave it undefined', () => {
		const persisted = mapper.toPersistence(
			Permission.create({ name: 'Read todo', resource: 'todo', action: 'read' }),
		);

		expect(persisted.isGlobal).toBe(false);
	});

	it('should survive a round trip through persistence', () => {
		const permission = Permission.create({
			name: 'Create todo',
			resource: 'todo',
			action: 'create',
			isGlobal: true,
		});

		const restored = mapper.toDomain(mapper.toPersistence(permission));

		expect(restored.equals(permission)).toBe(true);
		expect(restored.name.value).toBe('Create todo');
		expect(restored.resource.value).toBe('todo');
		expect(restored.action.value).toBe('create');
		expect(restored.description).toBeNull();
		expect(restored.isGlobal).toBe(true);
	});
});
