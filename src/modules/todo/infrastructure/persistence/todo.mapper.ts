import { Injectable } from '@nestjs/common';
import type { Mapper } from '@/shared/infrastructure/database';
import { Todo, TodoTitle } from '../../domain';
import { TodoOrmEntity } from './todo.orm-entity';

@Injectable()
export class TodoMapper implements Mapper<Todo, TodoOrmEntity> {
	toDomain(record: TodoOrmEntity): Todo {
		return Todo.restore(
			{
				title: TodoTitle.restore(record.title),
				description: record.description,
			},
			record.id,
			record.isActive,
		);
	}

	// Audit columns are left undefined so TypeORM keeps their stored values.
	toPersistence(todo: Todo): TodoOrmEntity {
		return Object.assign(new TodoOrmEntity(), {
			id: todo.id,
			isActive: todo.isActive,
			title: todo.title.value,
			description: todo.description,
		});
	}
}
