import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';
import { PermissionOrmEntity } from '@/modules/permission/infrastructure/persistence/permission.orm-entity';
import { BaseOrmEntity } from '@/shared/infrastructure/database';
import { ROLE_NAME_MAX_LENGTH } from '../../domain';

@Entity('roles')
export class RoleOrmEntity extends BaseOrmEntity {
	@Column({ name: 'name', type: 'varchar', length: ROLE_NAME_MAX_LENGTH })
	name: string;

	@Column({ name: 'description', type: 'text', nullable: true })
	description: string | null;

	// Owning side only: TypeORM creates `rel_role_permissions` (composite PK of both ids) and
	// diffs its rows on save. Leave undefined to keep the stored links untouched.
	@ManyToMany(() => PermissionOrmEntity)
	@JoinTable({
		name: 'rel_role_permissions',
		joinColumn: { name: 'role_id', referencedColumnName: 'id' },
		inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
	})
	permissions?: PermissionOrmEntity[];
}
