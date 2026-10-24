import { DomainErrorType, DomainException } from '@/shared/domain';
import { PermissionErrorKey } from './permission-error-key';

export class PermissionNotFoundException extends DomainException {
	constructor() {
		super(DomainErrorType.NOT_FOUND, PermissionErrorKey.NOT_FOUND);
	}
}
