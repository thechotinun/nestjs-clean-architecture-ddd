import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmBaseRepository } from '@/shared/infrastructure/database';
import type { Todo, TodoRepository } from '../../domain';
import { TodoMapper } from './todo.mapper';
import { TodoOrmEntity } from './todo.orm-entity';

@Injectable()
export class TodoTypeOrmRepository
	extends TypeOrmBaseRepository<Todo, TodoOrmEntity>
	implements TodoRepository
{
	constructor(
		@InjectRepository(TodoOrmEntity) repository: Repository<TodoOrmEntity>,
		mapper: TodoMapper,
	) {
		super(repository, mapper);
	}
}
