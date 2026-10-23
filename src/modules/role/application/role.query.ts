import type { QueryService } from '@/shared/application';
import { RoleNotFoundException } from '../domain';
import type { RoleView } from './role.view';

export const ROLE_QUERY_SERVICE = Symbol('ROLE_QUERY_SERVICE');

// Add role-specific read queries here (filters, search, ...).
export interface RoleQueryService extends QueryService<RoleView> {}

export async function getRoleViewOrThrow(query: RoleQueryService, id: string): Promise<RoleView> {
	const view = await query.findById(id);
	if (!view) throw new RoleNotFoundException();
	return view;
}
