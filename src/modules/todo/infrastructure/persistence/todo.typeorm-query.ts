import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { toBaseView, TypeOrmBaseQueryService } from '@/shared/infrastructure/database';
import type { TodoQueryService, TodoView } from '../../application';
import { TodoOrmEntity } from './todo.orm-entity';

@Injectable()
export class TodoTypeOrmQueryService
	extends TypeOrmBaseQueryService<TodoOrmEntity, TodoView>
	implements TodoQueryService
{
	constructor(@InjectRepository(TodoOrmEntity) repository: Repository<TodoOrmEntity>) {
		super(repository);
	}

	protected toView(record: TodoOrmEntity): TodoView {
		return {
			...toBaseView(record),
			title: record.title,
			description: record.description ?? null,
		};
	}
}
