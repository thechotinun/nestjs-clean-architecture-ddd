import { Inject, Injectable } from '@nestjs/common';
import type { UseCase } from '@/shared/application';
import { ROLE_REPOSITORY, RoleNotFoundException, type RoleRepository } from '../../domain';

@Injectable()
export class DeleteRoleUseCase implements UseCase<string, void> {
	constructor(@Inject(ROLE_REPOSITORY) private readonly roleRepository: RoleRepository) {}

	async execute(id: string): Promise<void> {
		const role = await this.roleRepository.findById(id);
		if (!role) throw new RoleNotFoundException();

		role.delete();
		await this.roleRepository.delete(role);
	}
}
