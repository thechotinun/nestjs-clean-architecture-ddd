import { Inject, Injectable } from '@nestjs/common';
import type { UseCase } from '@/shared/application';
import {
	Permission,
	PermissionAlreadyExistsException,
	PERMISSION_REPOSITORY,
	type PermissionRepository,
} from '../../domain';
import {
	getPermissionViewOrThrow,
	PERMISSION_QUERY_SERVICE,
	type PermissionQueryService,
} from '../permission.query';
import type { PermissionView } from '../permission.view';

export interface CreatePermissionInput {
	name: string;
	description?: string | null;
	resource: string;
	action: string;
	isGlobal?: boolean;
}

@Injectable()
export class CreatePermissionUseCase implements UseCase<CreatePermissionInput, PermissionView> {
	constructor(
		@Inject(PERMISSION_REPOSITORY) private readonly permissionRepository: PermissionRepository,
		@Inject(PERMISSION_QUERY_SERVICE) private readonly permissionQuery: PermissionQueryService,
	) {}

	async execute(input: CreatePermissionInput): Promise<PermissionView> {
		const permission = Permission.create(input);

		const existing = await this.permissionRepository.findByResourceAndAction(
			permission.resource.value,
			permission.action.value,
		);
		if (existing) throw new PermissionAlreadyExistsException();

		await this.permissionRepository.save(permission);
		return getPermissionViewOrThrow(this.permissionQuery, permission.id);
	}
}
