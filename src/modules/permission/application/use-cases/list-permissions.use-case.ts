import { Inject, Injectable } from '@nestjs/common';
import type { Paginated, PaginationParams, UseCase } from '@/shared/application';
import { PERMISSION_QUERY_SERVICE, type PermissionQueryService } from '../permission.query';
import type { PermissionView } from '../permission.view';

@Injectable()
export class ListPermissionsUseCase implements UseCase<
	PaginationParams,
	Paginated<PermissionView>
> {
	constructor(
		@Inject(PERMISSION_QUERY_SERVICE) private readonly permissionQuery: PermissionQueryService,
	) {}

	execute(params: PaginationParams): Promise<Paginated<PermissionView>> {
		return this.permissionQuery.findAll(params);
	}
}
