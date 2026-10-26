import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
	CreatePermissionUseCase,
	DeletePermissionUseCase,
	GetPermissionUseCase,
	ListPermissionsUseCase,
	PERMISSION_QUERY_SERVICE,
	UpdatePermissionUseCase,
} from './application';
import { PERMISSION_REPOSITORY } from './domain';
import { PermissionMapper } from './infrastructure/persistence/permission.mapper';
import { PermissionOrmEntity } from './infrastructure/persistence/permission.orm-entity';
import { PermissionTypeOrmQueryService } from './infrastructure/persistence/permission.typeorm-query';
import { PermissionTypeOrmRepository } from './infrastructure/persistence/permission.typeorm-repository';
import { PermissionController } from './presentation/permission.controller';

@Module({
	imports: [TypeOrmModule.forFeature([PermissionOrmEntity])],
	controllers: [PermissionController],
	providers: [
		PermissionMapper,
		{ provide: PERMISSION_REPOSITORY, useClass: PermissionTypeOrmRepository },
		{ provide: PERMISSION_QUERY_SERVICE, useClass: PermissionTypeOrmQueryService },
		CreatePermissionUseCase,
		GetPermissionUseCase,
		ListPermissionsUseCase,
		UpdatePermissionUseCase,
		DeletePermissionUseCase,
	],
	// Role assigns permissions by id and needs to check they exist.
	exports: [PERMISSION_REPOSITORY],
})
export class PermissionModule {}
