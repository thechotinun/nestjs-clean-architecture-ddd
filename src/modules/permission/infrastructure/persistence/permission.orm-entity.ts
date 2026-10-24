import { Column, Entity, Index } from 'typeorm';
import { BaseOrmEntity } from '@/shared/infrastructure/database';
import {
	PERMISSION_ACTION_MAX_LENGTH,
	PERMISSION_NAME_MAX_LENGTH,
	PERMISSION_RESOURCE_MAX_LENGTH,
} from '../../domain';

// Partial: a soft-deleted permission must not block re-creating the same resource/action.
@Index(['resource', 'action'], { unique: true, where: '"deleted_date" IS NULL' })
@Entity('permissions')
export class PermissionOrmEntity extends BaseOrmEntity {
	@Column({ name: 'name', type: 'varchar', length: PERMISSION_NAME_MAX_LENGTH })
	name: string;

	@Column({ name: 'description', type: 'text', nullable: true })
	description: string | null;

	@Column({ name: 'resource', type: 'varchar', length: PERMISSION_RESOURCE_MAX_LENGTH })
	resource: string;

	@Column({ name: 'action', type: 'varchar', length: PERMISSION_ACTION_MAX_LENGTH })
	action: string;

	@Column({ name: 'is_global', type: 'boolean', default: false })
	isGlobal: boolean;
}
