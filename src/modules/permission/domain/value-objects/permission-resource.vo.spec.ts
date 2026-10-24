import { InvalidPermissionResourceException } from '../exceptions';
import { PERMISSION_RESOURCE_MAX_LENGTH, PermissionResource } from './permission-resource.vo';

describe('PermissionResource', () => {
	it('should trim and lowercase input', () => {
		expect(PermissionResource.create('  Todo ').value).toBe('todo');
	});

	it.each(['', ' '.repeat(3), 'x'.repeat(PERMISSION_RESOURCE_MAX_LENGTH + 1)])(
		'should reject invalid input %#',
		(raw) => {
			expect(() => PermissionResource.create(raw)).toThrow(InvalidPermissionResourceException);
		},
	);

	it('should restore stored value without validation', () => {
		expect(PermissionResource.restore('  Legacy ').value).toBe('  Legacy ');
	});

	it('should compare by normalized value', () => {
		expect(PermissionResource.create('TODO').equals(PermissionResource.create(' todo '))).toBe(
			true,
		);
		expect(PermissionResource.create('todo').equals(PermissionResource.create('role'))).toBe(false);
	});
});
