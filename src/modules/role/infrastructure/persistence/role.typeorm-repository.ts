import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { type FindOptionsWhere, Repository } from 'typeorm';
import { TypeOrmBaseRepository } from '@/shared/infrastructure/database';
import type { Role, RoleRepository } from '../../domain';
import { RoleMapper } from './role.mapper';
import { RoleOrmEntity } from './role.orm-entity';

@Injectable()
export class RoleTypeOrmRepository
	extends TypeOrmBaseRepository<Role, RoleOrmEntity>
	implements RoleRepository
{
	constructor(
		@InjectRepository(RoleOrmEntity) repository: Repository<RoleOrmEntity>,
		mapper: RoleMapper,
	) {
		super(repository, mapper);
	}

	// Every load must include permissions: saving an aggregate that lost them would unlink them all.
	override async findById(id: string): Promise<Role | null> {
		return this.findOneWith(this.byId(id));
	}

	async findByName(name: string): Promise<Role | null> {
		return this.findOneWith({ name });
	}

	private async findOneWith(where: FindOptionsWhere<RoleOrmEntity>): Promise<Role | null> {
		const record = await this.repository.findOne({ where, relations: { permissions: true } });
		return record ? this.mapper.toDomain(record) : null;
	}
}
