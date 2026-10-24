import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { toBaseView, TypeOrmBaseQueryService } from '@/shared/infrastructure/database';
import type { PermissionQueryService, PermissionView } from '../../application';
import { PermissionOrmEntity } from './permission.orm-entity';

@Injectable()
export class PermissionTypeOrmQueryService
	extends TypeOrmBaseQueryService<PermissionOrmEntity, PermissionView>
	implements PermissionQueryService
{
	constructor(@InjectRepository(PermissionOrmEntity) repository: Repository<PermissionOrmEntity>) {
		super(repository);
	}

	protected toView(record: PermissionOrmEntity): PermissionView {
		return {
			...toBaseView(record),
			name: record.name,
			description: record.description ?? null,
			resource: record.resource,
			action: record.action,
			isGlobal: record.isGlobal,
		};
	}
}
