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
	Query,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Paginated } from '@/shared/application';
import { PaginationQueryDto } from '@/shared/presentation';
import {
	CreatePermissionUseCase,
	DeletePermissionUseCase,
	GetPermissionUseCase,
	ListPermissionsUseCase,
	type PermissionView,
	UpdatePermissionUseCase,
} from '../application';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Controller('permissions')
export class PermissionController {
	constructor(
		private readonly configService: ConfigService,
		private readonly createPermission: CreatePermissionUseCase,
		private readonly getPermission: GetPermissionUseCase,
		private readonly listPermissions: ListPermissionsUseCase,
		private readonly updatePermission: UpdatePermissionUseCase,
		private readonly deletePermission: DeletePermissionUseCase,
	) {}

	@Post()
	create(@Body() dto: CreatePermissionDto): Promise<PermissionView> {
		return this.createPermission.execute(dto);
	}

	@Get()
	findAll(@Query() query: PaginationQueryDto): Promise<Paginated<PermissionView>> {
		return this.listPermissions.execute(
			query.toParams(this.configService.get<number>('PER_PAGE')!),
		);
	}

	@Get(':id')
	findOne(@Param('id', ParseUUIDPipe) id: string): Promise<PermissionView> {
		return this.getPermission.execute(id);
	}

	@Patch(':id')
	update(
		@Param('id', ParseUUIDPipe) id: string,
		@Body() dto: UpdatePermissionDto,
	): Promise<PermissionView> {
		return this.updatePermission.execute({ id, ...dto });
	}

	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
		return this.deletePermission.execute(id);
	}
}
