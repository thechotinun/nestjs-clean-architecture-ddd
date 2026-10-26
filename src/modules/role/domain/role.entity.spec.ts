import { InvalidRoleNameException } from './exceptions';
import { Role } from './role.entity';
import { ROLE_NAME_MAX_LENGTH } from './value-objects';

describe('Role', () => {
	it('should create with trimmed name and null description by default', () => {
		const role = Role.create({ name: '  Admin  ' });

		expect(role.name.value).toBe('Admin');
		expect(role.description).toBeNull();
		expect(role.isActive).toBe(true);
	});

	it.each(['', ' '.repeat(3), 'x'.repeat(ROLE_NAME_MAX_LENGTH + 1)])(
		'should reject invalid name %#',
		(name) => {
			expect(() => Role.create({ name })).toThrow(InvalidRoleNameException);
		},
	);

	it('should update only provided fields and clear description with null', () => {
		const role = Role.create({ name: 'A', description: 'desc' });

		role.update({ name: ' B ' });
		expect(role.name.value).toBe('B');
		expect(role.description).toBe('desc');

		role.update({ description: null });
		expect(role.name.value).toBe('B');
		expect(role.description).toBeNull();
	});

	it('should start without permissions', () => {
		expect(Role.create({ name: 'A' }).permissionIds.size).toBe(0);
	});

	it('should replace the whole permission set and drop duplicates', () => {
		const role = Role.create({ name: 'A' });

		role.setPermissions(['p1', 'p2', 'p1']);
		expect([...role.permissionIds]).toEqual(['p1', 'p2']);

		role.setPermissions(['p3']);
		expect([...role.permissionIds]).toEqual(['p3']);

		role.setPermissions([]);
		expect(role.permissionIds.size).toBe(0);
	});

	it('should reject invalid name on update', () => {
		const role = Role.create({ name: 'A' });

		expect(() => role.update({ name: ' ' })).toThrow(InvalidRoleNameException);
		expect(role.name.value).toBe('A');
	});
});
