import type { Repository } from '@/shared/domain';
import type { Role } from './role.entity';

export const ROLE_REPOSITORY = Symbol('ROLE_REPOSITORY');

export interface RoleRepository extends Repository<Role> {
	findByName(name: string): Promise<Role | null>;
}
