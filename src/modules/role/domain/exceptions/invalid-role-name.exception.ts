import { DomainErrorType, DomainException } from '@/shared/domain';
import { RoleErrorKey } from './role-error-key';

export class InvalidRoleNameException extends DomainException {
	constructor() {
		super(DomainErrorType.VALIDATION, RoleErrorKey.INVALID_NAME);
	}
}
