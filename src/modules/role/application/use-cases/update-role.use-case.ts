import { Inject, Injectable } from '@nestjs/common';
import type { UseCase } from '@/shared/application';
import {
	ROLE_REPOSITORY,
	RoleNameAlreadyExistsException,
	RoleNotFoundException,
	type RoleRepository,
} from '../../domain';
import { getRoleViewOrThrow, ROLE_QUERY_SERVICE, type RoleQueryService } from '../role.query';
import type { RoleView } from '../role.view';

export interface UpdateRoleInput {
	id: string;
	name?: string;
	description?: string | null;
}

@Injectable()
export class UpdateRoleUseCase implements UseCase<UpdateRoleInput, RoleView> {
	constructor(
		@Inject(ROLE_REPOSITORY) private readonly roleRepository: RoleRepository,
		@Inject(ROLE_QUERY_SERVICE) private readonly roleQuery: RoleQueryService,
	) {}

	async execute({ id, ...changes }: UpdateRoleInput): Promise<RoleView> {
		const role = await this.roleRepository.findById(id);
		if (!role) throw new RoleNotFoundException();

		if (changes.name !== undefined && changes.name.trim() !== role.name.value) {
			const existing = await this.roleRepository.findByName(changes.name.trim());
			if (existing) throw new RoleNameAlreadyExistsException();
		}

		role.update(changes);
		await this.roleRepository.save(role);
		return getRoleViewOrThrow(this.roleQuery, id);
	}
}
