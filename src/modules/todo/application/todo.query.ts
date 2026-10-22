import type { QueryService } from '@/shared/application';
import { TodoNotFoundException } from '../domain';
import type { TodoView } from './todo.view';

export const TODO_QUERY_SERVICE = Symbol('TODO_QUERY_SERVICE');

// Add todo-specific read queries here (filters, search, ...).
export interface TodoQueryService extends QueryService<TodoView> {}

export async function getTodoViewOrThrow(query: TodoQueryService, id: string): Promise<TodoView> {
	const view = await query.findById(id);
	if (!view) throw new TodoNotFoundException();
	return view;
}
