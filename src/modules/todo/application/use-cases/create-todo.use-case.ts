import { Inject, Injectable } from '@nestjs/common';
import type { UseCase } from '@/shared/application';
import { Todo, TODO_REPOSITORY, type TodoRepository } from '../../domain';
import { getTodoViewOrThrow, TODO_QUERY_SERVICE, type TodoQueryService } from '../todo.query';
import type { TodoView } from '../todo.view';

export interface CreateTodoInput {
	title: string;
	description?: string | null;
}

@Injectable()
export class CreateTodoUseCase implements UseCase<CreateTodoInput, TodoView> {
	constructor(
		@Inject(TODO_REPOSITORY) private readonly todoRepository: TodoRepository,
		@Inject(TODO_QUERY_SERVICE) private readonly todoQuery: TodoQueryService,
	) {}

	async execute(input: CreateTodoInput): Promise<TodoView> {
		const todo = Todo.create(input);
		await this.todoRepository.save(todo);
		return getTodoViewOrThrow(this.todoQuery, todo.id);
	}
}
