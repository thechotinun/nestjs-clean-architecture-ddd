import { Inject, Injectable } from '@nestjs/common';
import {
	PERMISSION_REPOSITORY,
	PermissionNotFoundException,
	type PermissionRepository,
} from '@/modules/permission/domain';
import type { UseCase } from '@/shared/application';
import {
	GlobalPermissionNotAssignableException,
	ROLE_REPOSITORY,
	RoleNotFoundException,
	type RoleRepository,
} from '../../domain';
import { getRoleViewOrThrow, ROLE_QUERY_SERVICE, type RoleQueryService } from '../role.query';
import type { RoleView } from '../role.view';

export interface SetRolePermissionsInput {
	id: string;
	permissionIds: string[];
}

@Injectable()
export class SetRolePermissionsUseCase implements UseCase<SetRolePermissionsInput, RoleView> {
	constructor(
		@Inject(ROLE_REPOSITORY) private readonly roleRepository: RoleRepository,
		@Inject(PERMISSION_REPOSITORY) private readonly permissionRepository: PermissionRepository,
		@Inject(ROLE_QUERY_SERVICE) private readonly roleQuery: RoleQueryService,
	) {}

	async execute({ id, permissionIds }: SetRolePermissionsInput): Promise<RoleView> {
		const role = await this.roleRepository.findById(id);
		if (!role) throw new RoleNotFoundException();

		const uniqueIds = [...new Set(permissionIds)];
		const permissions = await this.permissionRepository.findByIds(uniqueIds);
		if (permissions.length !== uniqueIds.length) throw new PermissionNotFoundException();
		// Global permissions already reach every user; a role link would be dead data.
		if (permissions.some((permission) => permission.isGlobal)) {
			throw new GlobalPermissionNotAssignableException();
		}

		role.setPermissions(uniqueIds);
		await this.roleRepository.save(role);
		return getRoleViewOrThrow(this.roleQuery, id);
	}
}
