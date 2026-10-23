import { DomainErrorType, DomainException } from '@/shared/domain';
import { RoleErrorKey } from './role-error-key';

export class RoleNotFoundException extends DomainException {
	constructor() {
		super(DomainErrorType.NOT_FOUND, RoleErrorKey.NOT_FOUND);
	}
}
