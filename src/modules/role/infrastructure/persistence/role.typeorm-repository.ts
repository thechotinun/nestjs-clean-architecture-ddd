import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

	async findByName(name: string): Promise<Role | null> {
		const record = await this.repository.findOne({ where: { name } });
		return record ? this.mapper.toDomain(record) : null;
	}
}
