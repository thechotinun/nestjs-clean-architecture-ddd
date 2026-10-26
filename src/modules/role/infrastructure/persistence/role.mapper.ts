import { Injectable } from '@nestjs/common';
import { PermissionOrmEntity } from '@/modules/permission/infrastructure/persistence/permission.orm-entity';
import type { Mapper } from '@/shared/infrastructure/database';
import { Role, RoleName } from '../../domain';
import { RoleOrmEntity } from './role.orm-entity';

@Injectable()
export class RoleMapper implements Mapper<Role, RoleOrmEntity> {
	toDomain(record: RoleOrmEntity): Role {
		return Role.restore(
			{
				name: RoleName.restore(record.name),
				description: record.description,
				permissionIds: new Set((record.permissions ?? []).map((permission) => permission.id)),
			},
			record.id,
			record.isActive,
		);
	}

	// Audit columns are left undefined so TypeORM keeps their stored values.
	// Permissions are always sent (id-only stubs): an empty array must clear the links.
	toPersistence(role: Role): RoleOrmEntity {
		return Object.assign(new RoleOrmEntity(), {
			id: role.id,
			isActive: role.isActive,
			name: role.name.value,
			description: role.description,
			permissions: [...role.permissionIds].map((id) =>
				Object.assign(new PermissionOrmEntity(), { id }),
			),
		});
	}
}
