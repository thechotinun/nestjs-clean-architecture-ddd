import { InvalidRoleNameException } from '../exceptions';
import { ROLE_NAME_MAX_LENGTH, RoleName } from './role-name.vo';

describe('RoleName', () => {
	it('should trim input', () => {
		expect(RoleName.create('  Buy milk ').value).toBe('Buy milk');
	});

	it.each(['', ' '.repeat(3), 'x'.repeat(ROLE_NAME_MAX_LENGTH + 1)])(
		'should reject invalid input %#',
		(raw) => {
			expect(() => RoleName.create(raw)).toThrow(InvalidRoleNameException);
		},
	);

	it('should restore stored value without validation', () => {
		expect(RoleName.restore('  legacy ').value).toBe('  legacy ');
	});

	it('should compare by value', () => {
		expect(RoleName.create('A').equals(RoleName.create(' A '))).toBe(true);
		expect(RoleName.create('A').equals(RoleName.create('B'))).toBe(false);
	});
});
