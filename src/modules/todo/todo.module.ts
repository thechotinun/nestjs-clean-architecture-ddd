import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
	CreateTodoUseCase,
	DeleteTodoUseCase,
	GetTodoUseCase,
	ListTodosUseCase,
	TODO_QUERY_SERVICE,
	UpdateTodoUseCase,
} from './application';
import { TODO_REPOSITORY } from './domain';
import { TodoMapper } from './infrastructure/persistence/todo.mapper';
import { TodoOrmEntity } from './infrastructure/persistence/todo.orm-entity';
import { TodoTypeOrmQueryService } from './infrastructure/persistence/todo.typeorm-query';
import { TodoTypeOrmRepository } from './infrastructure/persistence/todo.typeorm-repository';
import { TodoController } from './presentation/todo.controller';

@Module({
	imports: [TypeOrmModule.forFeature([TodoOrmEntity])],
	controllers: [TodoController],
	providers: [
		TodoMapper,
		{ provide: TODO_REPOSITORY, useClass: TodoTypeOrmRepository },
		{ provide: TODO_QUERY_SERVICE, useClass: TodoTypeOrmQueryService },
		CreateTodoUseCase,
		GetTodoUseCase,
		ListTodosUseCase,
		UpdateTodoUseCase,
		DeleteTodoUseCase,
	],
})
export class TodoModule {}
