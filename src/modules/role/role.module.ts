import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
	CreateRoleUseCase,
	DeleteRoleUseCase,
	GetRoleUseCase,
	ListRolesUseCase,
	ROLE_QUERY_SERVICE,
	SetRolePermissionsUseCase,
	UpdateRoleUseCase,
} from './application';
import { PermissionModule } from '@/modules/permission/permission.module';
import { ROLE_REPOSITORY } from './domain';
import { RoleMapper } from './infrastructure/persistence/role.mapper';
import { RoleOrmEntity } from './infrastructure/persistence/role.orm-entity';
import { RoleTypeOrmQueryService } from './infrastructure/persistence/role.typeorm-query';
import { RoleTypeOrmRepository } from './infrastructure/persistence/role.typeorm-repository';
import { RoleController } from './presentation/role.controller';

@Module({
	imports: [TypeOrmModule.forFeature([RoleOrmEntity]), PermissionModule],
	controllers: [RoleController],
	providers: [
		RoleMapper,
		{ provide: ROLE_REPOSITORY, useClass: RoleTypeOrmRepository },
		{ provide: ROLE_QUERY_SERVICE, useClass: RoleTypeOrmQueryService },
		CreateRoleUseCase,
		GetRoleUseCase,
		ListRolesUseCase,
		UpdateRoleUseCase,
		DeleteRoleUseCase,
		SetRolePermissionsUseCase,
	],
})
export class RoleModule {}
