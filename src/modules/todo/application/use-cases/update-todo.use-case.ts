import { Inject, Injectable } from '@nestjs/common';
import type { UseCase } from '@/shared/application';
import { TODO_REPOSITORY, TodoNotFoundException, type TodoRepository } from '../../domain';
import { getTodoViewOrThrow, TODO_QUERY_SERVICE, type TodoQueryService } from '../todo.query';
import type { TodoView } from '../todo.view';

export interface UpdateTodoInput {
	id: string;
	title?: string;
	description?: string | null;
}

@Injectable()
export class UpdateTodoUseCase implements UseCase<UpdateTodoInput, TodoView> {
	constructor(
		@Inject(TODO_REPOSITORY) private readonly todoRepository: TodoRepository,
		@Inject(TODO_QUERY_SERVICE) private readonly todoQuery: TodoQueryService,
	) {}

	async execute({ id, ...changes }: UpdateTodoInput): Promise<TodoView> {
		const todo = await this.todoRepository.findById(id);
		if (!todo) throw new TodoNotFoundException();

		todo.update(changes);
		await this.todoRepository.save(todo);
		return getTodoViewOrThrow(this.todoQuery, id);
	}
}
