import { DomainErrorType, DomainException } from '@/shared/domain';
import { RoleErrorKey } from './role-error-key';

export class GlobalPermissionNotAssignableException extends DomainException {
	constructor() {
		super(DomainErrorType.BUSINESS_RULE, RoleErrorKey.GLOBAL_PERMISSION_NOT_ASSIGNABLE);
	}
}
