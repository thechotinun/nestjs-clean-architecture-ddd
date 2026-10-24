import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmBaseRepository } from '@/shared/infrastructure/database';
import type { Permission, PermissionRepository } from '../../domain';
import { PermissionMapper } from './permission.mapper';
import { PermissionOrmEntity } from './permission.orm-entity';

@Injectable()
export class PermissionTypeOrmRepository
	extends TypeOrmBaseRepository<Permission, PermissionOrmEntity>
	implements PermissionRepository
{
	constructor(
		@InjectRepository(PermissionOrmEntity) repository: Repository<PermissionOrmEntity>,
		mapper: PermissionMapper,
	) {
		super(repository, mapper);
	}

	async findByResourceAndAction(resource: string, action: string): Promise<Permission | null> {
		const record = await this.repository.findOne({ where: { resource, action } });
		return record ? this.mapper.toDomain(record) : null;
	}
}
