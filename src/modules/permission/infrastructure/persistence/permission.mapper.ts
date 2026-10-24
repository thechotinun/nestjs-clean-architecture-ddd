import { Injectable } from '@nestjs/common';
import type { Mapper } from '@/shared/infrastructure/database';
import { Permission, PermissionAction, PermissionName, PermissionResource } from '../../domain';
import { PermissionOrmEntity } from './permission.orm-entity';

@Injectable()
export class PermissionMapper implements Mapper<Permission, PermissionOrmEntity> {
	toDomain(record: PermissionOrmEntity): Permission {
		return Permission.restore(
			{
				name: PermissionName.restore(record.name),
				description: record.description,
				resource: PermissionResource.restore(record.resource),
				action: PermissionAction.restore(record.action),
				isGlobal: record.isGlobal,
			},
			record.id,
			record.isActive,
		);
	}

	// Audit columns are left undefined so TypeORM keeps their stored values.
	toPersistence(permission: Permission): PermissionOrmEntity {
		return Object.assign(new PermissionOrmEntity(), {
			id: permission.id,
			isActive: permission.isActive,
			name: permission.name.value,
			description: permission.description,
			resource: permission.resource.value,
			action: permission.action.value,
			isGlobal: permission.isGlobal,
		});
	}
}
