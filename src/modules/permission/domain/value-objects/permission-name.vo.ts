import { ValueObject } from '@/shared/domain';
import { InvalidPermissionNameException } from '../exceptions';

export const PERMISSION_NAME_MAX_LENGTH = 100;

export class PermissionName extends ValueObject<{ value: string }> {
	/**
	From user input: trimmed and validated.
	*/
	static create(raw: string): PermissionName {
		const value = raw.trim();
		if (!value || value.length > PERMISSION_NAME_MAX_LENGTH) {
			throw new InvalidPermissionNameException();
		}
		return new PermissionName({ value });
	}

	/**
	From persistence: trusted as stored, so legacy rows never fail to load.
	*/
	static restore(value: string): PermissionName {
		return new PermissionName({ value });
	}

	get value(): string {
		return this.props.value;
	}
}
