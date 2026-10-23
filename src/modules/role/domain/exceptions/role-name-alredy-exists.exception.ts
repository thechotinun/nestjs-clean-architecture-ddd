import { DomainErrorType, DomainException } from '@/shared/domain';
import { RoleErrorKey } from './role-error-key';

export class RoleNameAlreadyExistsException extends DomainException {
	constructor() {
		super(DomainErrorType.CONFLICT, RoleErrorKey.NAME_ALREADY_EXISTS);
	}
}
