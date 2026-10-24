import { DomainErrorType, DomainException } from '@/shared/domain';
import { PermissionErrorKey } from './permission-error-key';

export class InvalidPermissionNameException extends DomainException {
	constructor() {
		super(DomainErrorType.VALIDATION, PermissionErrorKey.INVALID_NAME);
	}
}
