import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	ParseUUIDPipe,
	Patch,
	Post,
	Put,
	Query,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Paginated } from '@/shared/application';
import { PaginationQueryDto } from '@/shared/presentation';
import {
	CreateRoleUseCase,
	DeleteRoleUseCase,
	GetRoleUseCase,
	ListRolesUseCase,
	type RoleView,
	SetRolePermissionsUseCase,
	UpdateRoleUseCase,
} from '../application';
import { CreateRoleDto } from './dto/create-role.dto';
import { SetRolePermissionsDto } from './dto/set-role-permissions.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Controller('roles')
export class RoleController {
	constructor(
		private readonly configService: ConfigService,
		private readonly createRole: CreateRoleUseCase,
		private readonly getRole: GetRoleUseCase,
		private readonly listRoles: ListRolesUseCase,
		private readonly updateRole: UpdateRoleUseCase,
		private readonly deleteRole: DeleteRoleUseCase,
		private readonly setRolePermissions: SetRolePermissionsUseCase,
	) {}

	@Post()
	create(@Body() dto: CreateRoleDto): Promise<RoleView> {
		return this.createRole.execute(dto);
	}

	@Get()
	findAll(@Query() query: PaginationQueryDto): Promise<Paginated<RoleView>> {
		return this.listRoles.execute(query.toParams(this.configService.get<number>('PER_PAGE')!));
	}

	@Get(':id')
	findOne(@Param('id', ParseUUIDPipe) id: string): Promise<RoleView> {
		return this.getRole.execute(id);
	}

	@Patch(':id')
	update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateRoleDto): Promise<RoleView> {
		return this.updateRole.execute({ id, ...dto });
	}

	@Put(':id/permissions')
	setPermissions(
		@Param('id', ParseUUIDPipe) id: string,
		@Body() dto: SetRolePermissionsDto,
	): Promise<RoleView> {
		return this.setRolePermissions.execute({ id, ...dto });
	}

	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
		return this.deleteRole.execute(id);
	}
}
