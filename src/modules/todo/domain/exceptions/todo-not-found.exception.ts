import { DomainErrorType, DomainException } from '@/shared/domain';
import { TodoErrorKey } from './todo-error-key';

export class TodoNotFoundException extends DomainException {
	constructor() {
		super(DomainErrorType.NOT_FOUND, TodoErrorKey.NOT_FOUND);
	}
}
