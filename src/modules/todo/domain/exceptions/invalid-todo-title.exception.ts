import { DomainErrorType, DomainException } from '@/shared/domain';
import { TodoErrorKey } from './todo-error-key';

export class InvalidTodoTitleException extends DomainException {
	constructor() {
		super(DomainErrorType.VALIDATION, TodoErrorKey.INVALID_TITLE);
	}
}
