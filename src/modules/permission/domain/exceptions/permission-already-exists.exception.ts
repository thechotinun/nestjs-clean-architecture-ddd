import { DomainErrorType, DomainException } from '@/shared/domain';
import { PermissionErrorKey } from './permission-error-key';

export class PermissionAlreadyExistsException extends DomainException {
	constructor() {
		super(DomainErrorType.CONFLICT, PermissionErrorKey.ALREADY_EXISTS);
	}
}
