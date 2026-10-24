import { InvalidPermissionNameException } from '../exceptions';
import { PERMISSION_NAME_MAX_LENGTH, PermissionName } from './permission-name.vo';

describe('PermissionName', () => {
	it('should trim input and keep its case', () => {
		expect(PermissionName.create('  Create Todo ').value).toBe('Create Todo');
	});

	it.each(['', ' '.repeat(3), 'x'.repeat(PERMISSION_NAME_MAX_LENGTH + 1)])(
		'should reject invalid input %#',
		(raw) => {
			expect(() => PermissionName.create(raw)).toThrow(InvalidPermissionNameException);
		},
	);

	it('should restore stored value without validation', () => {
		expect(PermissionName.restore('  legacy ').value).toBe('  legacy ');
	});

	it('should compare by value', () => {
		expect(PermissionName.create('A').equals(PermissionName.create(' A '))).toBe(true);
		expect(PermissionName.create('A').equals(PermissionName.create('B'))).toBe(false);
	});
});
