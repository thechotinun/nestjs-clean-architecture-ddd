import { ValueObject } from '@/shared/domain';
import { InvalidRoleNameException } from '../exceptions';

export const ROLE_NAME_MAX_LENGTH = 50;

export class RoleName extends ValueObject<{ value: string }> {
	/**
	From user input: trimmed and validated.
	*/
	static create(raw: string): RoleName {
		const value = raw.trim();
		if (!value || value.length > ROLE_NAME_MAX_LENGTH) {
			throw new InvalidRoleNameException();
		}
		return new RoleName({ value });
	}

	/**
	From persistence: trusted as stored, so legacy rows never fail to load.
	*/
	static restore(value: string): RoleName {
		return new RoleName({ value });
	}

	get value(): string {
		return this.props.value;
	}
}
