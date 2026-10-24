import { ValueObject } from '@/shared/domain';
import { InvalidPermissionResourceException } from '../exceptions';

export const PERMISSION_RESOURCE_MAX_LENGTH = 50;

export class PermissionResource extends ValueObject<{ value: string }> {
	/**
	From user input: trimmed and lowercased, so `Todo` and `todo` cannot become two permissions.
	*/
	static create(raw: string): PermissionResource {
		const value = raw.trim().toLowerCase();
		if (!value || value.length > PERMISSION_RESOURCE_MAX_LENGTH) {
			throw new InvalidPermissionResourceException();
		}
		return new PermissionResource({ value });
	}

	/**
	From persistence: trusted as stored, so legacy rows never fail to load.
	*/
	static restore(value: string): PermissionResource {
		return new PermissionResource({ value });
	}

	get value(): string {
		return this.props.value;
	}
}
