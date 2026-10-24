import { Inject, Injectable } from '@nestjs/common';
import type { UseCase } from '@/shared/application';
import {
	PermissionNotFoundException,
	PERMISSION_REPOSITORY,
	type PermissionRepository,
} from '../../domain';

@Injectable()
export class DeletePermissionUseCase implements UseCase<string, void> {
	constructor(
		@Inject(PERMISSION_REPOSITORY) private readonly permissionRepository: PermissionRepository,
	) {}

	async execute(id: string): Promise<void> {
		const permission = await this.permissionRepository.findById(id);
		if (!permission) throw new PermissionNotFoundException();

		permission.delete();
		await this.permissionRepository.delete(permission);
	}
}
