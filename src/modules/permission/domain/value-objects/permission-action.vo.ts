import { ValueObject } from '@/shared/domain';
import { InvalidPermissionActionException } from '../exceptions';

export const PERMISSION_ACTION_MAX_LENGTH = 50;

export class PermissionAction extends ValueObject<{ value: string }> {
	/**
	From user input: trimmed and lowercased, so `Create` and `create` cannot become two permissions.
	*/
	static create(raw: string): PermissionAction {
		const value = raw.trim().toLowerCase();
		if (!value || value.length > PERMISSION_ACTION_MAX_LENGTH) {
			throw new InvalidPermissionActionException();
		}
		return new PermissionAction({ value });
	}

	/**
	From persistence: trusted as stored, so legacy rows never fail to load.
	*/
	static restore(value: string): PermissionAction {
		return new PermissionAction({ value });
	}

	get value(): string {
		return this.props.value;
	}
}
