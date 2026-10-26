import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { toBaseView, TypeOrmBaseQueryService } from '@/shared/infrastructure/database';
import type { RoleQueryService, RoleView } from '../../application';
import { RoleOrmEntity } from './role.orm-entity';

@Injectable()
export class RoleTypeOrmQueryService
	extends TypeOrmBaseQueryService<RoleOrmEntity, RoleView>
	implements RoleQueryService
{
	protected override readonly relations = { permissions: true };

	constructor(@InjectRepository(RoleOrmEntity) repository: Repository<RoleOrmEntity>) {
		super(repository);
	}

	protected toView(record: RoleOrmEntity): RoleView {
		return {
			...toBaseView(record),
			name: record.name,
			description: record.description ?? null,
			permissionIds: (record.permissions ?? []).map((permission) => permission.id),
		};
	}
}
