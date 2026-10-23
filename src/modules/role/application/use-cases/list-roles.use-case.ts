import { Inject, Injectable } from '@nestjs/common';
import type { Paginated, PaginationParams, UseCase } from '@/shared/application';
import { ROLE_QUERY_SERVICE, type RoleQueryService } from '../role.query';
import type { RoleView } from '../role.view';

@Injectable()
export class ListRolesUseCase implements UseCase<PaginationParams, Paginated<RoleView>> {
	constructor(@Inject(ROLE_QUERY_SERVICE) private readonly roleQuery: RoleQueryService) {}

	execute(params: PaginationParams): Promise<Paginated<RoleView>> {
		return this.roleQuery.findAll(params);
	}
}
