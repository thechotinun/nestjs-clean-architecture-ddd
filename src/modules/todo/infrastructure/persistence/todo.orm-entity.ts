import { Column, Entity } from 'typeorm';
import { BaseOrmEntity } from '@/shared/infrastructure/database';
import { TODO_TITLE_MAX_LENGTH } from '../../domain';

@Entity('todos')
export class TodoOrmEntity extends BaseOrmEntity {
	@Column({ name: 'title', type: 'varchar', length: TODO_TITLE_MAX_LENGTH })
	title: string;

	@Column({ name: 'description', type: 'text', nullable: true })
	description: string | null;
}
