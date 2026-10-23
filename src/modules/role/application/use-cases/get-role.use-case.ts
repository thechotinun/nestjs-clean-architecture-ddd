import { Inject, Injectable } from '@nestjs/common';
import type { UseCase } from '@/shared/application';
import { getRoleViewOrThrow, ROLE_QUERY_SERVICE, type RoleQueryService } from '../role.query';
import type { RoleView } from '../role.view';

@Injectable()
export class GetRoleUseCase implements UseCase<string, RoleView> {
	constructor(@Inject(ROLE_QUERY_SERVICE) private readonly roleQuery: RoleQueryService) {}

	execute(id: string): Promise<RoleView> {
		return getRoleViewOrThrow(this.roleQuery, id);
	}
}
