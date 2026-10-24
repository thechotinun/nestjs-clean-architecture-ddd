import { Inject, Injectable } from '@nestjs/common';
import type { UseCase } from '@/shared/application';
import {
	PermissionAlreadyExistsException,
	PermissionNotFoundException,
	PERMISSION_REPOSITORY,
	type PermissionRepository,
} from '../../domain';
import {
	getPermissionViewOrThrow,
	PERMISSION_QUERY_SERVICE,
	type PermissionQueryService,
} from '../permission.query';
import type { PermissionView } from '../permission.view';

export interface UpdatePermissionInput {
	id: string;
	name?: string;
	description?: string | null;
	resource?: string;
	action?: string;
	isGlobal?: boolean;
}

@Injectable()
export class UpdatePermissionUseCase implements UseCase<UpdatePermissionInput, PermissionView> {
	constructor(
		@Inject(PERMISSION_REPOSITORY) private readonly permissionRepository: PermissionRepository,
		@Inject(PERMISSION_QUERY_SERVICE) private readonly permissionQuery: PermissionQueryService,
	) {}

	async execute({ id, ...changes }: UpdatePermissionInput): Promise<PermissionView> {
		const permission = await this.permissionRepository.findById(id);
		if (!permission) throw new PermissionNotFoundException();

		const before = { resource: permission.resource.value, action: permission.action.value };
		// Applied first so resource/action are normalized (trim, lowercase) before the duplicate lookup.
		permission.update(changes);

		const hasPairChanged =
			permission.resource.value !== before.resource || permission.action.value !== before.action;
		if (hasPairChanged) {
			const existing = await this.permissionRepository.findByResourceAndAction(
				permission.resource.value,
				permission.action.value,
			);
			if (existing) throw new PermissionAlreadyExistsException();
		}

		await this.permissionRepository.save(permission);
		return getPermissionViewOrThrow(this.permissionQuery, id);
	}
}
