import { InvalidPermissionActionException } from '../exceptions';
import { PERMISSION_ACTION_MAX_LENGTH, PermissionAction } from './permission-action.vo';

describe('PermissionAction', () => {
	it('should trim and lowercase input', () => {
		expect(PermissionAction.create('  Create ').value).toBe('create');
	});

	it.each(['', ' '.repeat(3), 'x'.repeat(PERMISSION_ACTION_MAX_LENGTH + 1)])(
		'should reject invalid input %#',
		(raw) => {
			expect(() => PermissionAction.create(raw)).toThrow(InvalidPermissionActionException);
		},
	);

	it('should restore stored value without validation', () => {
		expect(PermissionAction.restore('  Legacy ').value).toBe('  Legacy ');
	});

	it('should compare by normalized value', () => {
		expect(PermissionAction.create('CREATE').equals(PermissionAction.create(' create '))).toBe(
			true,
		);
		expect(PermissionAction.create('create').equals(PermissionAction.create('read'))).toBe(false);
	});
});
