import { Column, Entity } from 'typeorm';
import { BaseOrmEntity } from '@/shared/infrastructure/database';
import { ROLE_NAME_MAX_LENGTH } from '../../domain';

@Entity('roles')
export class RoleOrmEntity extends BaseOrmEntity {
	@Column({ name: 'name', type: 'varchar', length: ROLE_NAME_MAX_LENGTH })
	name: string;

	@Column({ name: 'description', type: 'text', nullable: true })
	description: string | null;
}
