import type { Repository } from '@/shared/domain';
import type { Permission } from './permission.entity';

export const PERMISSION_REPOSITORY = Symbol('PERMISSION_REPOSITORY');

export interface PermissionRepository extends Repository<Permission> {
	findByIds(ids: string[]): Promise<Permission[]>;
	findByResourceAndAction(resource: string, action: string): Promise<Permission | null>;
}
