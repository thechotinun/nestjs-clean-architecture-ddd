import {
	InvalidPermissionActionException,
	InvalidPermissionNameException,
	InvalidPermissionResourceException,
} from './exceptions';
import { Permission } from './permission.entity';

const valid = { name: 'Create todo', resource: 'todo', action: 'create' };

describe('Permission', () => {
	it('should create with normalized fields, null description and isGlobal false by default', () => {
		const permission = Permission.create({
			name: '  Create todo  ',
			resource: ' Todo ',
			action: ' CREATE ',
		});

		expect(permission.name.value).toBe('Create todo');
		expect(permission.resource.value).toBe('todo');
		expect(permission.action.value).toBe('create');
		expect(permission.description).toBeNull();
		expect(permission.isGlobal).toBe(false);
		expect(permission.isActive).toBe(true);
	});

	it('should create a global permission', () => {
		expect(Permission.create({ ...valid, isGlobal: true }).isGlobal).toBe(true);
	});

	it('should reject invalid name, resource and action', () => {
		expect(() => Permission.create({ ...valid, name: ' ' })).toThrow(
			InvalidPermissionNameException,
		);
		expect(() => Permission.create({ ...valid, resource: ' ' })).toThrow(
			InvalidPermissionResourceException,
		);
		expect(() => Permission.create({ ...valid, action: '' })).toThrow(
			InvalidPermissionActionException,
		);
	});

	it('should update only provided fields and clear description with null', () => {
		const permission = Permission.create({ ...valid, description: 'desc' });

		permission.update({ name: ' New ', isGlobal: true });
		expect(permission.name.value).toBe('New');
		expect(permission.isGlobal).toBe(true);
		expect(permission.description).toBe('desc');
		expect(permission.resource.value).toBe('todo');
		expect(permission.action.value).toBe('create');

		permission.update({ description: null, resource: 'Role', action: 'READ' });
		expect(permission.description).toBeNull();
		expect(permission.resource.value).toBe('role');
		expect(permission.action.value).toBe('read');
		expect(permission.name.value).toBe('New');
	});

	it('should allow turning isGlobal off with false', () => {
		const permission = Permission.create({ ...valid, isGlobal: true });

		permission.update({ isGlobal: false });

		expect(permission.isGlobal).toBe(false);
	});

	it('should reject invalid values on update and keep the current ones', () => {
		const permission = Permission.create(valid);

		expect(() => permission.update({ name: ' ' })).toThrow(InvalidPermissionNameException);
		expect(() => permission.update({ resource: ' ' })).toThrow(InvalidPermissionResourceException);
		expect(() => permission.update({ action: ' ' })).toThrow(InvalidPermissionActionException);
		expect(permission.name.value).toBe('Create todo');
		expect(permission.resource.value).toBe('todo');
		expect(permission.action.value).toBe('create');
	});
});
