import { Inject, Injectable } from '@nestjs/common';
import type { UseCase } from '@/shared/application';
import {
	Role,
	ROLE_REPOSITORY,
	RoleNameAlreadyExistsException,
	type RoleRepository,
} from '../../domain';
import { getRoleViewOrThrow, ROLE_QUERY_SERVICE, type RoleQueryService } from '../role.query';
import type { RoleView } from '../role.view';

export interface CreateRoleInput {
	name: string;
	description?: string | null;
}

@Injectable()
export class CreateRoleUseCase implements UseCase<CreateRoleInput, RoleView> {
	constructor(
		@Inject(ROLE_REPOSITORY) private readonly roleRepository: RoleRepository,
		@Inject(ROLE_QUERY_SERVICE) private readonly roleQuery: RoleQueryService,
	) {}

	async execute(input: CreateRoleInput): Promise<RoleView> {
		const role = Role.create(input);

		const existing = await this.roleRepository.findByName(role.name.value);
		if (existing) throw new RoleNameAlreadyExistsException();

		await this.roleRepository.save(role);
		return getRoleViewOrThrow(this.roleQuery, role.id);
	}
}
