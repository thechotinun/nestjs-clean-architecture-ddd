import { DomainErrorType, DomainException } from '@/shared/domain';
import { PermissionErrorKey } from './permission-error-key';

export class InvalidPermissionActionException extends DomainException {
	constructor() {
		super(DomainErrorType.VALIDATION, PermissionErrorKey.INVALID_ACTION);
	}
}
